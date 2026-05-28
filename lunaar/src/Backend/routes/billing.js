
import {razorpay} from "../config/razorpay.js"
import express from "express"
import crypto from "crypto"
import {supabase} from "../config/supabase.js"

const router = express.Router();

router.post("/create-subscription", async (req,res) => {

 const {user_id,plan_id} = req.body

 const {data,error} = await supabase
 .from("plan")
 .select('*')
 .eq("id",plan_id)
 .single()

 if(error){
    console.log(error)
    return res.status(500).json({error:error.message})
 }

   const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpay_plan_id,
    customer_notify: 1,
    notes: { user_id },
  });

  res.json(subscription);

})

export default router;


