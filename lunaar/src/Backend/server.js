import { supabase } from './config/supabase.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Chat_Handler } from './Chatbot.js'
import { startOAuth, handleOAuthCallback } from './config/oauth.js'
import { handleInstagramMessage } from './integrations.js/instagram.js'

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/chat', Chat_Handler)

app.get("/auth/google", startOAuth);
app.get("/auth/google/callback", handleOAuthCallback);

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
  res.sendStatus(200)
  await handleInstagramMessage(req.body)
})

app.listen(PORT,() => {
    console.log('server is running on port 5000')
})