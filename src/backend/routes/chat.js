import express from "express";
import supabase from "../utils/supabaseConfig.js";
import {supabaseAdmin} from "../utils/supabaseConfig.js";
import multer from 'multer';
import { renderQueue, countActiveJobsForUser } from "../queues/renderQueue.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

router.post("/chat", upload.array("images"), async (req, res) => {

    const { user_message, user_id, chatbot_id, ai_provider, ai_model, api_key } = req.body;

    if(api_key.trim().length === 0){
        return res.json({message:"No api key passed pls enter a api key in the settings button"})
    }

    try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);

        if (userError || !userData?.user) {
            return res.status(401).json({ error: "Could not verify user" });
        }

        const activeCount = await countActiveJobsForUser(chatbot_id);
        if (activeCount >= 1) {
            return res.status(429).json({
                message: "A request is already being handled. Please wait for it to finish before sending another."
            });
        }
    } catch (err) {
        console.error("Pre-check failed:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }

    let history = [];
    try {
        history = JSON.parse(req.body.history || "[]");
    } catch (err) {
        console.error("Invalid history JSON", err);
    }

    const files = req.files || [];

    const roles = Array.isArray(req.body.roles) ? req.body.roles : [req.body.roles];
    const assetIds = Array.isArray(req.body.assetIds) ? req.body.assetIds : [req.body.assetIds];

    const assets = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = assetIds[i];
        const role = roles[i];

        if (!file) continue;

        const filePath = `Image/${Date.now()}-${file.originalname}`;
        const { error } = await supabase.storage.from("Logo").upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
        });

        if (error) {
            console.error(error);
            continue;
        }

        const { data } = supabase.storage.from("Logo").getPublicUrl(filePath);

        assets.push({ id, role, url: data.publicUrl });
    }

    try {
        const { error: convoError } = await supabase
            .from("conversations")
            .insert({
                message: user_message,
                role: "user",
                id: user_id,
                chatbot_id: chatbot_id,
                created_at: new Date().toISOString()
            });

        if (convoError) {
            console.log(convoError);
            return res.status(500).json({ error: convoError.message });
        }

        const job = await renderQueue.add("render", {
            user_message,
            user_id,
            chatbot_id,
            ai_provider,
            ai_model,
            api_key,
            history,
            assets
        });

        res.json({ jobId: job.id, status: "queued" });

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || "Something went wrong" });
        }
    }
});

router.get("/job/:jobId", async (req, res) => {
    const job = await renderQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const state = await job.getState();
    const result = state === "completed" ? job.returnvalue : null;
    const failReason = state === "failed" ? job.failedReason : null;

    res.json({ state, result, error: failReason });
});

export default router;