
import express from "express";
import supabase from "../utils/supabaseConfig.js";
import {supabaseAdmin} from "../utils/supabaseConfig.js";
import multer from 'multer';
import { renderQueue, countActiveJobsForUser } from "../queues/renderQueue.js";

const router = express.Router();

router.delete("/delete/:chatbot_id", async (req,res) => {

 try{

  const {chatbot_id} = req.params

  if(!chatbot_id) return

  const {data,error} = await supabase
  .from("conversations")
  .delete()
  .eq("chatbot_id",chatbot_id)

  if(error){
    console.log(error)
    return
  }

  res.json({success:true})


 }catch(e){
    return res.json({message:e})
 }

})

export default router;