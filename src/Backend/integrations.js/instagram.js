import { supabase } from '../config/supabase.js'
import { Chat_Handler } from '../Chatbot.js'

/**
 * Send a reply via Instagram Messaging API.
 * Using Instagram Graph API with the Instagram User Access Token (IGAAS/IGQ prefix).
 * Endpoint: /me/messages with the token as a query param (not Authorization header).
 */
export async function sendInstagramReply(recipientId, text, accessToken) {
  const url = `https://graph.instagram.com/v21.0/me/messages`

  console.log(`📤 Sending to ${recipientId}...`)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient:    { id: recipientId },
      message:      { text },
      access_token: accessToken,
    }),
  })

  const result = await response.json()
  if (result.error) {
    console.error('❌ Instagram send error:', JSON.stringify(result.error))
  } else {
    console.log(`✅ Replied to ${recipientId}: ${text}`)
  }
}

// In-memory session store (per sender)
const sessions = {}

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = { history: [] }
  return sessions[userId]
}

export async function handleInstagramMessage(body) {
  const messaging = body.entry?.[0]?.messaging?.[0]
  if (!messaging?.message?.text) return

  // Ignore echo messages (sent by the bot itself)
  if (messaging.message.is_echo) {
    console.log("⚠️ Echo message, ignoring")
    return
  }

  const senderId = messaging.sender.id
  const userText = messaging.message.text
  const pageId   = messaging.recipient.id

  console.log(`📩 DM from ${senderId}: ${userText}`)
  console.log(`📄 Bot account ID: ${pageId}`)

  const { data, error } = await supabase
    .from('chatbots')
    .select('share_token, instagram_access_token, instagram_page_id')
    .eq('instagram_page_id', pageId)
    .limit(1)

  console.log("🔍 Supabase lookup:", JSON.stringify(data), "error:", error)

  if (error || !data?.[0]) {
    console.error('❌ No chatbot found for page ID:', pageId)
    return
  }

  const share_token = data[0].share_token
  const accessToken = data[0].instagram_access_token

  if (!accessToken) {
    console.error('❌ No access token found')
    return
  }

  console.log("✅ Found chatbot:", share_token)
  console.log("🔑 Token prefix:", accessToken.slice(0, 8))

  // Build session history
  const session = getSession(senderId)
  session.history.push({ role: 'user', content: userText })

  // Call Chat_Handler with a fake req/res
  let captured = null
  const fakeReq = {
    body: {
      user_message: userText,
      history:      session.history.slice(-10),
      share_token,
    }
  }
  const fakeRes = {
    json:       (d)    => { captured = d },
    status:     (code) => {
      console.log("⚠️ fakeRes.status called with:", code)
      return { json: (d) => { captured = d } }
    },
    sendStatus: (code) => { console.log("⚠️ fakeRes.sendStatus:", code) },
  }

  await Chat_Handler(fakeReq, fakeRes)
  console.log("🤖 Captured:", JSON.stringify(captured))

  const replyText = captured?.reply ?? captured?.message ?? "Sorry, something went wrong 😔"
  session.history.push({ role: 'assistant', content: replyText })

  await sendInstagramReply(senderId, replyText, accessToken)
}