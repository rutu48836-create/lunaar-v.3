
import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "../config/supabase.js"

const router = express.Router();
router.post("/create-subscription", async (req,res) => {
console.log("new code")
 
 const {user_id,plan_id} = req.body

 
 const {data: plan} = await supabase
 .from("plans")
 .select('*')
 .eq("id",plan_id)
 .single()

 console.log(`plan is`,plan)

   const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpay_plan_id,
    total_count: 12,
    customer_notify: 1,
    notes: { user_id },
  });

  res.json(subscription);

})

export default router;

