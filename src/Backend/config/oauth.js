import { google } from "googleapis";
import { supabase } from "./supabase.js";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI 
);

export const startOAuth = (req, res) => {
  const { chatbot_id, owner_id } = req.query;

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",       // gets refresh_token
    prompt: "consent",            // forces refresh_token every time
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: JSON.stringify({ chatbot_id, owner_id }),  // passed back after redirect
  });

  res.redirect(url);
};

// Step 2: Google redirects here with ?code=...
export const handleOAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  const { chatbot_id, owner_id } = JSON.parse(state);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // tokens = { access_token, refresh_token, expiry_date }

    const { error } = await supabase
      .from("google_oauth_tokens")
      .upsert({
        owner_id,
        chatbot_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expiry_date).toISOString(),

      }, { onConflict: "chatbot_id" });

    if (error) throw error;

    // Redirect back to your dashboard
    res.redirect(`https://lunaar.online/dashboard?connected=true`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.redirect(`https://lunaar.online/dashboard?connected=false`);
  }
};