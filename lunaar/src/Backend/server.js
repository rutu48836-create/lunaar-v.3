import { supabase } from './config/supabase.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Chat_Handler } from './Chatbot.js'
import { startOAuth, handleOAuthCallback } from './config/oauth.js'

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/chat', Chat_Handler)

app.get("/auth/google", startOAuth);
app.get("/auth/google/callback", handleOAuthCallback);

app.listen(PORT,() => {
    console.log('server is running on port 5000')
})