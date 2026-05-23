import { supabase } from '../config/supabase.js'
import { Chat_Handler } from '../Chatbot.js' 

// ─── Send reply back to Instagram ────────────────────────────────
export async function sendInstagramReply(recipientId, text) {
  const url = `https://graph.facebook.com/v19.0/me/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  })

  const result = await response.json()
  if (result.error) console.error('❌ Instagram send error:', result.error)
  else console.log(`✅ Replied to ${recipientId}: ${text}`)
}

// ─── Per-user conversation history ───────────────────────────────
const sessions = {}

function getSession(userId) {
  if (!sessions[userId]) sessions[userId] = { history: [] }
  return sessions[userId]
}

// ─── Main handler — called from server.js ────────────────────────
export async function handleInstagramMessage(body) {
  const messaging = body.entry?.[0]?.messaging?.[0]
  if (!messaging?.message?.text) return

  const senderId = messaging.sender.id
  const userText = messaging.message.text
  const pageId   = body.entry?.[0]?.id

  console.log(`📩 DM from ${senderId}: ${userText}`)

  // Find which Lunaar chatbot maps to this Instagram page
  const { data, error } = await supabase
    .from('chatbots')
    .select('share_token')
    .eq('instagram_page_id', pageId)
    .limit(1)

  if (error || !data?.[0]) {
    console.error('No chatbot found for page:', pageId)
    return
  }

  const share_token = data[0].share_token
  const session     = getSession(senderId)

  session.history.push({ role: 'user', content: userText })

  // Call your existing Chat_Handler with fake req/res
  let captured = null

  const fakeReq = {
    body: {
      user_message: userText,
      history: session.history.slice(-10),
      share_token,
    }
  }

  const fakeRes = {
    json:       (data) => { captured = data },
    status:     (code) => ({ json: (data) => { captured = data } }),
    sendStatus: () => {},
  }

  await Chat_Handler(fakeReq, fakeRes)

  const replyText = captured?.reply ?? "Sorry, something went wrong 😔"
  session.history.push({ role: 'assistant', content: replyText })

  await sendInstagramReply(senderId, replyText)
}