import { supabase, supabaseAdmin } from './config/supabase.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Chat_Handler } from './Chatbot.js'
import { startOAuth, handleOAuthCallback } from './config/oauth.js'
import { handleInstagramMessage } from './integrations.js/instagram.js'
import billingRoutes from "./routes/billing.js";
import webhookRoutes from "./routes/webhook.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const REDIRECT_URI = 'https://lunaar-v-3.onrender.com/auth/instagram/callback'

app.use(cors())
app.use(express.json())

app.post('/api/chat', Chat_Handler)

app.get("/auth/google", startOAuth)
app.get("/auth/google/callback", handleOAuthCallback)

// ── Instagram Webhook verification ──────────────────────────────────────────
app.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verified')
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
})

app.post('/webhook', async (req, res) => {
  console.log("📬 RAW BODY:", JSON.stringify(req.body, null, 2))
  res.sendStatus(200)
  await handleInstagramMessage(req.body)
})

// ── Instagram OAuth — start ──────────────────────────────────────────────────
app.get('/auth/instagram', (req, res) => {
  const chatbotId = req.query.chatbotId
  const url =
    `https://api.instagram.com/oauth/authorize?` +
    `client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=instagram_business_basic,instagram_business_manage_messages` +
    `&response_type=code` +
    `&state=${chatbotId}`
  console.log("🔗 Redirecting to:", url)
  res.redirect(url)
})

// ── Instagram OAuth — callback ───────────────────────────────────────────────
app.get('/auth/instagram/callback', async (req, res) => {
  const { code, state: chatbotId, error } = req.query

  if (error || !code) {
    console.log("User cancelled or no code received")
    return res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
  }

  try {
    console.log("📥 Callback hit with code:", code?.slice(0, 20))
    console.log("📤 Using redirect_uri:", REDIRECT_URI)
    console.log("📤 Using client_id:", process.env.META_APP_ID)

    // Step 1 — Exchange code for short-lived Instagram User Access Token
    const params = new URLSearchParams()
    params.append('client_id',     process.env.META_APP_ID)
    params.append('client_secret', process.env.META_APP_SECRET)
    params.append('grant_type',    'authorization_code')
    params.append('redirect_uri',  REDIRECT_URI)
    params.append('code',          code)

    const tokenRes = await fetch(`https://api.instagram.com/oauth/access_token`, {
      method: 'POST',
      body: params
    })
    const tokenData = await tokenRes.json()
    console.log("🔑 Short-lived token data:", JSON.stringify(tokenData))

    const shortLivedToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    if (!shortLivedToken) {
      console.error("❌ No access token:", tokenData)
      return res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
    }

    // Step 2 — Exchange for long-lived token (valid 60 days)
    const llRes = await fetch(
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${process.env.META_APP_SECRET}` +
      `&access_token=${shortLivedToken}`
    )
    const llData = await llRes.json()
    console.log("🔑 Long-lived token data:", JSON.stringify(llData))

    const longLivedToken = llData.access_token
    if (!longLivedToken) {
      console.error("❌ Could not get long-lived token:", llData)
      return res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
    }

    // Step 3 — Get Instagram Business Account ID
    const igRes = await fetch(
      `https://graph.instagram.com/v19.0/me?fields=id,name,username&access_token=${longLivedToken}`
    )
    const igData = await igRes.json()
    console.log("👤 Instagram user:", JSON.stringify(igData))

    const instagramPageId = igData.id
    if (!instagramPageId) {
      console.error("❌ Could not get Instagram user ID:", igData)
      return res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
    }

    // Step 4 — Save to Supabase
    const { data, error: supabaseError } = await supabaseAdmin
      .from('chatbots')
      .update({
        instagram_page_id:      instagramPageId,
        instagram_access_token: longLivedToken,
      })
      .eq('id', chatbotId)
      .select()

    console.log("📝 Supabase result:", JSON.stringify(data), "error:", supabaseError)

    if (supabaseError) {
      console.error("❌ Supabase error:", supabaseError)
      return res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
    }

    console.log(`✅ Connected — Instagram ID: ${instagramPageId} → chatbot: ${chatbotId}`)
    res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=connected`)

  } catch (err) {
    console.error("❌ OAuth error:", err)
    res.redirect(`${process.env.FRONTEND_URL}/Dashboard?instagram=failed`)
  }
})

app.use("/api/billing", billingRoutes);
app.use("/api/webhook", webhookRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})