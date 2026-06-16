import {supabase} from "./config/supabase.js"
import express from 'express'
import cors from 'cors'
import { createCalendarEvent } from "./config/calendar.js"

export const Chat_Handler = async (req,res) => {

    const {user_message,history,share_token} = req.body
    console.log("share_token received:", share_token)

try{

if(!user_message || !share_token){
    return res.status(400).json({error:"No message or share token"})
}

const {data, error} = await supabase
  .from("chatbots")
  .select("*")
  .ilike("share_token", share_token.trim())
  .limit(1)

console.log("TOKEN:", JSON.stringify(share_token))

  const chatbot = data?.[0] 
  const type = chatbot.type;
  const chatbot_id = chatbot.id;

if (error) {
  return res.status(500).json({ error})
}

if (!chatbot) {
  return res.status(404).json({ error: "Chatbot not found" })
}

console.log("data:",chatbot)

const chatbotContext = `
name: ${chatbot.name || ""}
prompt: ${chatbot.prompt || ""}
`

  const today = new Date().toLocaleDateString();


const systemPrompt_faq = `
CRITICAL INSTRUCTION: Respond ONLY with raw JSON. No preamble, no markdown, no text outside the JSON.

You are a helpful FAQ assistant.

PERSONALITY:
- Friendly, clear, and concise.
- Never sound robotic or overly formal.
- One emoji per message inside the message field only.

KNOWLEDGE BASE:
${chatbotContext}

INSTRUCTIONS:
- Answer ONLY using the knowledge base above.
- If the question is not covered in the knowledge base, reply: "I don't have information on that, please contact us directly 😊"
- Never make up or assume information not in the knowledge base.
- Do not answer questions unrelated to the knowledge base topic.

RESPONSE STYLE:
- Max 50 words per reply.
- 1 to 3 sentences only.
- Be direct and solution-focused.

RESPONSE FORMAT — always exactly this, nothing else:
{
  "message": "your reply here with emoji"
}
`
const systemPrompt_lead = `
CRITICAL INSTRUCTION: You MUST respond ONLY with raw JSON. No greetings, no text before or after. Just the JSON object.

You are a friendly customer support assistant.

PERSONALITY:
- Warm, empathetic, and patient.
- Keep replies short, clear, and helpful.
- Never sound robotic or formal.
- Add one emoji per message INSIDE the message field only.

KNOWLEDGE BASE:
${chatbotContext}

INSTRUCTIONS:
- Answer ONLY using the knowledge base above.
- If you don't know, say: "sorry i dont have answer"
- Never make up information.

RESPONSE STYLE:
- Max 40 words per reply.
- 1 to 3 sentences only.
- Be kind and solution-focused.

LEAD DETECTION:
- A lead is someone who shows interest in buying, booking, pricing, availability, or getting a service.
- Passively collect name and phone from the conversation — never ask for both at once.
- Ask naturally for ONE piece at a time.
- Once you have both name and phone, mark detected as true and never ask again.
- Collect what they are interested in, max 8 words, as a string.

Also follow: ${chatbot.prompt}

YOUR RESPONSE MUST ALWAYS BE EXACTLY THIS JSON STRUCTURE AND NOTHING ELSE:
{
  "message": "your reply here with emoji",
  "lead": {
    "detected": false,
    "name": null,
    "phone": null,
    "interest_in": null
  }
}` ;

const systemPrompt_appointment = `
CRITICAL: You MUST respond ONLY with raw JSON. Absolutely no text before or after. No greetings. No explanations. ONLY the JSON object.

You are a friendly appointment scheduling assistant.

KNOWLEDGE BASE:
${chatbotContext}

and today's date is ${today}

YOUR GOAL: Collect these 4 fields naturally in conversation:
  - name (full name)
  - email (valid email address)
  - date (output as YYYY-MM-DD)
  - time (output as "H:MM AM/PM")

RULES:
- Ask for ONE field at a time, naturally.
- Confirm the appointment before marking ready as true.
- Once all 4 are collected and confirmed, set ready: true.
- Max 30 words per message.
- Add one emoji per message.
- NEVER write plain text. ALWAYS return the JSON object below.

EXAMPLE OUTPUT:
{
  "message": "Sure! What's your name? 😊",
  "appointment": {
    "ready": false,
    "name": null,
    "email": null,
    "date": null,
    "time": null
  }
}

YOUR RESPONSE MUST ALWAYS BE EXACTLY THIS STRUCTURE — NOTHING ELSE:
{
  "message": "your reply here",
  "appointment": {
    "ready": false,
    "name": null,
    "email": null,
    "date": null,
    "time": null
  }
}
`;

const Prompt = type === "Leads" ? systemPrompt_lead : systemPrompt_faq;
const finalPrompt = type === "Appointment" ? systemPrompt_appointment : Prompt;

function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim()
    return JSON.parse(cleaned)
  } catch (e) {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (e2) {
        return null
      }
    }
    return null
  }
}

const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
messages: [
  { role: "system", content: finalPrompt},
  ...history,
  { role: "user", content: user_message }
],
      temperature: 0.7,
      max_tokens: 500,
    }),
  }
);

const result = await response.json();
console.log("groq result:", result)
const raw = result.choices?.[0]?.message?.content

if (type === "Leads") {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return res.json({ reply: parsed.message, lead: parsed.lead })
  } catch (e) {
    console.warn("Failed to parse lead JSON:", raw)
    return res.json({ reply: raw, lead: null })
  }
}

if (type === "Appointment") {

  try{
  const parsed = safeParseJSON(raw)

  if (!parsed) {
    console.warn("Appointment JSON parse failed, raw:", raw)
    return res.json({ reply: raw, appointment: null })
  }

  if (parsed.appointment?.ready === true) {
    const { name, email, date, time } = parsed.appointment

    const googleEventId = await createCalendarEvent(chatbot_id, { name, email, date, time })

    await supabase.from("appointments").insert({
      chatbot_id,
      name, email, date, time,
      google_event_id: googleEventId,
    })

    return res.json({
      reply: parsed.message,
      appointment: { name, email, date, time },
    })
  }

  return res.json({ reply: parsed.message, appointment: null })
  }
  
catch(err){
  console.log(err)
}

}

}
catch(error){
    console.error("SERVER ERROR:",error)
    return res.status(500).json({error:"Internal server error"})
}

}