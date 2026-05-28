
import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "../config/supabase.js"

const router = express.Router();
router.post("/create-subscription", async (req,res) => {

 const {user_id} = req.body
const plan_id = process.env.PLAN_ID
 
 const {data: plan,error} = await supabase
 .from("plans")
 .select('*')
 .eq("razorpay_plan_id",plan_id)
 .single()

 if(error){
    console.log(error)
    return res.status(500).json({error:error.message})
 }

   const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpay_plan_id,
    total_count: 12,
    customer_notify: 1,
    notes: { user_id },
  });

  res.json(subscription);

})

export default router;


