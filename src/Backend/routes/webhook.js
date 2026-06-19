import express from "express"
import crypto from "crypto"
import { supabase, supabaseAdmin } from "../config/supabase.js" 

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Step 1 — parse body first
    const payload = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString())
      : typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    console.log("🔔 Webhook received, event:", payload?.event);

    // Step 2 — verify signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (secret && signature) {
      const bodyForHmac = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(payload));

      const expected = crypto
        .createHmac("sha256", secret)
        .update(bodyForHmac)
        .digest("hex");

      if (signature !== expected) {
        console.log("❌ Invalid signature");
        return res.status(400).json({ error: "Invalid signature" });
      }
    }

    const event = payload?.event;

    // Step 3 — guard against non-subscription events
    if (!payload?.payload?.subscription?.entity) {
      console.log("⚠️ No subscription entity in payload, event was:", event);
      console.log("⚠️ Full payload:", JSON.stringify(payload, null, 2));
      return res.json({ status: "ok" });
    }

    const sub = payload.payload.subscription.entity;
    const user_id = sub.notes?.user_id;

    console.log("📦 Event:", event);
    console.log("👤 user_id:", user_id);
    console.log("📋 razorpay plan_id:", sub.plan_id);

    if (!user_id) {
      console.log("❌ No user_id in subscription notes");
      return res.json({ status: "ok" });
    }

    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("razorpay_plan_id", sub.plan_id)
      .single();

    console.log("📊 Plan found:", plan);

    if (event === "subscription.activated") {
      const limits = {
        Growth: { total_messages_limit: 1000, chatbot_limit: 3 },
        TEST:   { total_messages_limit: 5000, chatbot_limit: 10 },
        Agency: { total_messages_limit: 12000, chatbot_limit: 50 },
      };

      const planLimits = limits[plan?.id] || limits["Growth"];

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          plan: plan?.id,
          subscription_id: sub.id,
          total_messages_limit: planLimits.total_messages_limit,
          chatbot_limit: planLimits.chatbot_limit,
          subscription_status: "active",
        })
        .eq("id", user_id);

      console.log("✅ Profile update error:", error);
    }

    if (event === "subscription.halted" || event === "subscription.cancelled") {
      await supabase
        .from("profiles")
        .update({
          plan: "free",
          total_messages_limit: 100,
          chatbot_limit: 1,
          subscription_status: "inactive",
        })
        .eq("id", user_id);
    }

    res.json({ status: "ok" });

  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;