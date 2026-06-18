import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "../config/supabase.js"

const router = express.Router();
router.post("/", async (req, res) => {
  const event = req.body.event;          // string e.g. "subscription.activated"
  const sub = req.body.payload.subscription.entity;
  const user_id = sub.notes?.user_id;

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("razorpay_plan_id", sub.plan_id)  // ← sub not subscription
    .single();

  if (event === "subscription.activated") {  // ← event directly, not event.event
    const limits = {
      Growth: { total_messages_limit: 1000, chatbot_limit: 3 },
      TEST:   { total_messages_limit: 5000, chatbot_limit: 10 },
      Agency: { total_messages_limit: 12000, chatbot_limit: 50 },
    };

    const planLimits = limits[plan?.id] || limits["Growth"];

    await supabase
      .from("profiles")
      .update({
        plan: plan?.id,
        subscription_id: sub.id,          // ← sub not subscription
        total_messages_limit: planLimits.total_messages_limit,
        chatbot_limit: planLimits.chatbot_limit,
        subscription_status: "active",
      })
      .eq("id", user_id);
  }

  if (event === "subscription.halted" || event === "subscription.cancelled") {
    await supabase
      .from("profiles")
      .update({
        plan: "Free",
        total_messages_limit: 100,
        chatbot_limit: 1,
        subscription_status: "inactive",
      })
      .eq("id", user_id);
  }

  res.json({ status: "ok" });
});

export default router;