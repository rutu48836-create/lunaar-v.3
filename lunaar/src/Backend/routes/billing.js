
import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "../config/supabase.js"

const router = express.Router();
router.post("/create-subscription", async (req,res) => {

 const {user_id} = req.body
const plan_id = "Growth"
 
 const {data: plan,error} = await supabase
 .from("plans")
 .select('*')
 .eq("id","Growth")
 .maybeSingle()
 
 if(error){
    console.log(error)
    return res.status(500).json({error:error.message})
 }

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


