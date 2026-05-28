import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "..config/supabase.js"

const router = express.Router();

router.post("/",async (req,res) => {

   const event = req.body.event;

  if (event === "subscription.activated") {
    const sub = req.body.payload.subscription.entity;
    const user_id = sub.notes.user_id;

   const {data:user,error:userError} = await supabase
   .from("profile")
   .update({
    plan:sub.plan_id,
    razorpay_subscription_id:sub.id,
    subscription_status:sub.status,
    message_limit:1000
   })
   .eq("id",user_id)

   if(userError){
    return res.status(500).json({error:userError.message})
   }

  }

  res.json({ status: "ok" });

})

export default router;