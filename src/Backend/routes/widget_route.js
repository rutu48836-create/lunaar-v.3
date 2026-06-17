import {supabase} from "./config/supabase.js"
import express from 'express'
const router = express.Router()

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
 
router.get("/api/chatbot-meta", async (req, res) => {
  const { token } = req.query;
 
  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }
 
  const { data, error } = await supabase
    .from("chatbots")
    .select("name, color, logo_url")
    .eq("share_token", token)
    .single();
 
  if (error || !data) {
    return res.status(404).json({ error: "Chatbot not found" });
  }
 
  res.json(data);
});
 
module.exports = router;
 