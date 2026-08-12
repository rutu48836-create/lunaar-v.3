import 'dotenv/config';

import { Worker } from 'bullmq';
import { connection } from './utils/redisConfig.js';
import Groq from "groq-sdk";
import axios from "axios";
import fs from "fs";
import * as cheerio from "cheerio";
import supabase from "./utils/supabaseConfig.js"
import { supabaseAdmin } from "./utils/supabaseConfig.js"
import { renderVideo } from "./utils/render.js";
import { fetchStockImages } from "./utils/Images.js";
import { PALETTES, TYPE_SCALE, CARD_ARCHETYPES, paletteByKey } from "./utils/designSystem.js";
import {Anthropic} from "@anthropic-ai/sdk"

const defaultGroq = new Groq({ apiKey: process.env.GROQ_KEY });

async function callGroq({ apiKey, model, messages }) {
    const client = apiKey ? new Groq({ apiKey }) : defaultGroq;

    const completion = await client.chat.completions.create({
        messages,
        model: model || "llama-3.1-8b-instant",
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        stream: true,
        stop: null,
    });

    let text = "";
    for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) text += content;
    }
    return text;
}

async function callGemini({ apiKey, model, messages }) {

    const key = apiKey;
    const modelName = model || "gemini-3.5-flash";

    if (!key) {
        throw new Error("No Gemini API key provided");
    }

    const contents = messages
        .filter(m => m.role !== "system")
        .map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
        }));

    const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`,
        { contents }
    );

    const text = res.data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    if (!text) {
        throw new Error("Gemini returned an empty response");
    }
    return text;
}

async function CallClaude({ apiKey, model, messages }) {
    if (!apiKey) return;

    const anthropic = new Anthropic({ apiKey });

    const systemMessages = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const chatMessages = messages.filter(m => m.role !== "system");

    try {
        const response = await anthropic.messages.create({
            model: model || "claude-sonnet-5",
            max_tokens: 8192,
            system: systemMessages || undefined,
            messages: chatMessages
        });

        const textBlock = response.content.find(b => b.type === "text");
        if (!textBlock) {
            throw new Error("Claude response contained no text block");
        }
        return textBlock.text;
    } catch (e) {
        throw e;
    }
}

async function generateAIResponse({ provider, model, apiKey, messages }) {
    if (provider === "Gemini") {
        return callGemini({ apiKey, model, messages });
    }
    if (provider === "Claude" || provider === "Anthropic") {
        return CallClaude({ apiKey, model, messages });
    }
    return callGroq({ apiKey, model, messages });
}

const get_video = async (chatbot_id) => {
    const { data } = await supabase
        .from("conversations")
        .select("video_data")
        .eq("chatbot_id", chatbot_id)
        .not("video_data", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return data?.video_data || null;
};

function buildImageBlock(stockImages) {
    return stockImages.length
        ? `AVAILABLE IMAGES (pick max 1 if relevant, use the exact URL):\n${stockImages.map((img, i) => `${i + 1}. ${img.url} (${img.alt})`).join("\n")}`
        : `NO IMAGES AVAILABLE — do not use <img> tags.`;
}

// Handles both the NEW multi-scene videoData shape ({ scenes: [...] }) and
// OLDER single-scene rows saved before scenes existed ({ background, cardHtml }),
// so "redesign" still works against videos generated before this change.
function buildLastVideoBlock(lastVideo) {
    if (!lastVideo) {
        return `EXISTING VIDEO: None — there is nothing to edit yet. Treat this as a "new" intent.`;
    }

    const scenes = lastVideo.scenes?.length
        ? lastVideo.scenes
        : [{ role: "scene", background: lastVideo.background, cardHtml: lastVideo.cardHtml }];

    const scenesBlock = scenes
        .map((s, i) => `Scene ${i + 1} (${s.role || "scene"}) — palette: ${s.background}\nHTML:\n${s.cardHtml}`)
        .join("\n\n");

    const transitionsBlock = lastVideo.transitions?.length
        ? `\nTransitions currently in use: ${lastVideo.transitions.map(t => t.type).join(" -> ")}`
        : "";

    return `EXISTING VIDEO (from the previous message, ${scenes.length} scene${scenes.length > 1 ? "s" : ""}):
${scenesBlock}${transitionsBlock}`;
}

function buildDesignSystemBlock() {
    const paletteList = Object.keys(PALETTES).join(", ");
    const typeList = Object.entries(TYPE_SCALE)
        .map(([role, v]) => `  ${role} -> class="${v.classes} ${v.font}"`)
        .join("\n");
    const archetypeList = Object.entries(CARD_ARCHETYPES)
        .map(([key, v]) => `  ${key}: ${v.description} (regions in order: ${v.regions.join(" > ")})`)
        .join("\n");

    return `
DESIGN SYSTEM — pick from these, never invent your own colors or ad-hoc font sizes:

Palettes (pass the KEY as each scene's "background" field, not a raw color): ${paletteList}
Default bias: prefer lighter, softer palettes unless the request signals a dark/bold mood.

Type scale (use these exact Tailwind class strings for the matching role):
${typeList}

Layout archetypes (pick the one that fits each scene's content, follow its region order):
${archetypeList}
`;
}

function buildMotionBlock() {
    return `
MOTION — every meaningful content element (not layout wrapper divs) must carry:
  data-anim="fade-up" | "fade-down" | "fade-scale" | "fade-scale-down" |
             "slide-left" | "slide-right" | "slide-up" | "slide-down" |
             "rotate-in" | "flip-in" | "blur-in" | "pop" | "fade"
  data-anim-index="N"
  data-anim-spring="gentle" | "snappy" | "bouncy" | "stiff" | "elastic"

OPTIONAL — ambient motion for at most 1 element per scene:
  data-anim-loop="float" | "breathe" | "pulse-opacity"

OPTIONAL — only if a scene must clear content before ending:
  data-anim-exit="fade" | "fade-down" | "fade-up" | "scale-out" |
                  "slide-out-left" | "slide-out-right" | "blur-out"

Do not put data-anim on the outer container — only on the text/image/number elements.
This is per-scene element motion — separate from the scene-to-scene TRANSITIONS below.
`;
}

function buildScenesBlock(sceneCount) {
    if (sceneCount === 1) {
        return `
=========================
SCENE STRUCTURE — this video has exactly 1 scene, no transitions
=========================

The single scene must do everything: hook, payoff, and close, composed together in one frame. Treat it as one polished hero shot, not a cramped compression of 3 scenes into one.

RULES:
- durationInFrames: at least 150 (5s at 30fps), at most 240 (8s).
- Return "transitions" as an empty array [].
`;
    }

    if (sceneCount === 2) {
        return `
=========================
SCENE STRUCTURE — this video has exactly 2 scenes, in this order
=========================

1. "intro" — hooks attention, sets the topic.
2. "cta" — the payoff (key feature/stat) and the close, together.

RULES ACROSS SCENES:
- Keep the SAME palette across both scenes.
- Vary the LAYOUT ARCHETYPE and focal point between the two scenes.
- Each scene's cardHtml is fully self-contained.
- durationInFrames: 120-150 per scene (4-5s).

TRANSITIONS — exactly 1 transition, one of: "crossfade" | "slide-left" | "slide-right" | "wipe" | "cut". Pick to match the content's energy.
`;
    }

    return `
=========================
SCENE STRUCTURE — every "new" video has exactly 3 scenes, in this order
=========================

1. "intro" — hooks attention. Headline or logo-led. Short, punchy, sets the topic.
2. "stat" — the payoff/content. This is where a chart, number, comparison, or key feature lives (see DATA VISUALIZATION below if the request involves data).
3. "cta" — closes the video. A short call-to-action line (e.g. "Get started today", a handle/website, a logo) styled as a bold closing statement — not a real clickable button, just a strong final visual moment.

RULES ACROSS SCENES:
- Keep the SAME palette across all 3 scenes unless the user explicitly asks for a mood/color shift mid-video — visual continuity matters more than per-scene novelty.
- Vary the LAYOUT ARCHETYPE and focal point per scene so it doesn't feel like the same card three times.
- Each scene's cardHtml is fully self-contained.
- durationInFrames per scene: the TOTAL video must be at least 10 seconds (300 frames at 30fps) after transitions overlap. Use 100-120 (3.3-4s) for "intro" and "cta". Use 130-160 (4.3-5.3s) for "stat" if it holds a chart. Never go below these minimums.

TRANSITIONS — exactly 2 transitions total (between scene 1→2 and scene 2→3), each one of:
  "crossfade"   — smooth dissolve, safest default, use for most cases
  "slide-left"  — new scene pushes in from the right
  "slide-right" — new scene pushes in from the left, use sparingly
  "wipe"        — hard directional wipe, punchier/energetic topics
  "cut"         — instant hard cut, high-energy/snappy content

Pick transitions that fit the content's energy.
`;
}

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Fixes a common LLM mistake: using Python-style triple-quoted strings
// ("""...""") instead of valid JSON double-quoted strings for cardHtml.
function fixTripleQuotedStrings(str) {
    return str.replace(/:(\s*)"""([\s\S]*?)"""/g, (match, whitespace, content) => {
        const escaped = JSON.stringify(content); // correctly escapes quotes, newlines, backslashes
        return `:${whitespace}${escaped}`;
    });
}

// Escapes raw control characters (newlines, tabs, etc.) ONLY when they appear
// inside a JSON string value — leaves the JSON's own structural whitespace
// (between keys) untouched, unlike a naive global replace.
function sanitizeJsonControlChars(str) {
    let result = "";
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
        }

        if (char === "\\") {
            result += char;
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            result += char;
            continue;
        }

        if (inString) {
            if (char === "\n") { result += "\\n"; continue; }
            if (char === "\r") { continue; }
            if (char === "\t") { result += "\\t"; continue; }
            const code = char.charCodeAt(0);
            if (code < 0x20) {
                result += "\\u" + code.toString(16).padStart(4, "0");
                continue;
            }
        }

        result += char;
    }

    return result;
}

function parseJsonResponse(content_text) {
    let raw = content_text.trim();
    raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();

    raw = fixTripleQuotedStrings(raw);

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.log('First JSON.parse failed:', err.message);
    }

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        return null;
    }

    const extracted = raw.slice(firstBrace, lastBrace + 1);

    try {
        return JSON.parse(extracted);
    } catch (err) {
        console.log('Extracted JSON.parse failed:', err.message);
    }

    const sanitized = sanitizeJsonControlChars(extracted);
    try {
        return JSON.parse(sanitized);
    } catch (err) {
        console.log('Sanitized JSON.parse failed:', err.message);
    }

    return null;
}

// Checks that cardHtml actually parses into real element content, not just
// broken/empty markup that would render as a blank or malformed card.
function isCardHtmlWellFormed(cardHtml) {
    try {
        const $ = cheerio.load(cardHtml, { xmlMode: false });
        return $.root().children().length > 0;
    } catch {
        return false;
    }
}

// Extracts every <img src="..."> value from cardHtml.
function extractImgSrcs(cardHtml) {
    const $ = cheerio.load(cardHtml, { xmlMode: false });
    const srcs = [];
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src) srcs.push(src);
    });
    return srcs;
}

// Rejects any cardHtml that references an image URL the model wasn't actually
// given — i.e. hallucinated URLs (like ephemeral Google thumbnail links)
// instead of an uploaded asset or a fetched stock image.
function hasOnlyAllowedImageUrls(cardHtml, assets, stockImages) {
    const allowedUrls = new Set([
        ...assets.map(a => a.url),
        ...stockImages.map(img => img.url)
    ]);

    const usedSrcs = extractImgSrcs(cardHtml);

    return usedSrcs.every(src => allowedUrls.has(src));
}

function buildIntentPrompt({ user_message, lastVideo }) {
    const hasExistingCard = !!lastVideo;

    return `
You are the intent router for a promotional video generator (multi-scene, with transitions).

DECIDE ONE INTENT for the user's message:

- "chat" — the user is greeting you, asking a question, making small talk, or the message is too vague/short to clearly request a video.
- "new" — the user CLEARLY and EXPLICITLY wants a new promotional video generated (e.g. describes a product, a promo, an ad, specific content to put on a video). This INCLUDES any request to visualize, chart, graph, plot, or show data/statistics/numbers/comparisons/trends visually — treat these exactly like a video request, NOT like a request for a text answer or an external charting tool. There is no separate "chart mode" — a chart, graph, or data visualization IS a video.
- "redesign" — the user wants to modify an EXISTING video (only valid if EXISTING VIDEO is present below), and explicitly references changing something about it (a specific scene, the transitions, or a global change like the palette).

DEFAULT TO "chat" WHEN UNSURE. Only pick "new" or "redesign" when the request is unambiguous.

If intent is "new", also decide "sceneCount": how many scenes the video should have, from 1 to 3.
Default to 3. Set it to 1 ONLY if the user explicitly asks for a single clip, single scene, one scene only, or similar ("just one scene", "single clip", "one clip only", "one scene clip"). Set it to 2 if the user asks for two scenes or a short two-part video. Otherwise use 3.

Examples:
- "yo" → chat
- "hey whats up" → chat
- "can we just talk, no video" → chat
- "make me a promo video for my coffee shop, dark theme" → new, sceneCount 3
- "visualize India's regional population data" → new, sceneCount 3
- "show me a bar chart of quarterly sales" → new, sceneCount 3
- "just create a single clip, only one scene clip for my app" → new, sceneCount 1
- "make a quick two-scene teaser" → new, sceneCount 2
- "change the background to blue" → redesign (only if EXISTING VIDEO is present)
- "make the intro scene pop more" → redesign (only if EXISTING VIDEO is present)
- "use a wipe transition instead" → redesign (only if EXISTING VIDEO is present)

NEVER respond to a chart/graph/visualization request with "I can't generate charts in chat" or similar — that is incorrect, this system generates exactly that kind of visual as a video. Any mention of visualizing, charting, graphing, or plotting data is a "new" intent, full stop.

EXISTING VIDEO: ${hasExistingCard ? "present" : "none"}

If intent is "chat", also write a short, natural reply to the user's message.
If intent is "new" or "redesign", do NOT write any scene HTML here — just return the intent and sceneCount.
Any HTML string content MUST be valid JSON string content — output it as a SINGLE LINE with NO literal line breaks. Do not press enter/newline inside the HTML; if you want readability, that's not needed here — output must be strictly valid JSON.

Respond ONLY with JSON, no markdown fences:

{
  "intent": "chat" | "new" | "redesign",
  "reply": "only present when intent is chat",
  "sceneCount": 1 | 2 | 3
}

USER MESSAGE:
${user_message}
`;
}

function buildGenerationPrompt({ intent, user_message, assets, stockImages, lastVideo, sceneCount = 3 }) {

    const imageBlock = buildImageBlock(stockImages);
    const lastVideoBlock = buildLastVideoBlock(lastVideo);
    const designSystemBlock = buildDesignSystemBlock();
    const motionBlock = buildMotionBlock();
    const scenesBlock = buildScenesBlock(intent === "new" ? sceneCount : 3);

    const effectiveSceneCount = intent === "new" ? sceneCount : 3;

    const sceneSchemaExample = effectiveSceneCount === 1
        ? `{"role":"main","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":180}`
        : effectiveSceneCount === 2
        ? `{"role":"intro","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":130},
    {"role":"cta","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":130}`
        : `{"role":"intro","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":75},
    {"role":"stat","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":90},
    {"role":"cta","background":"PALETTE_KEY","cardHtml":"...","durationInFrames":75}`;

    const transitionsSchemaExample = effectiveSceneCount === 1
        ? ""
        : effectiveSceneCount === 2
        ? `{"type":"crossfade"}`
        : `{"type":"crossfade"},
    {"type":"slide-left"}`;

    return `
You are an award-winning motion designer creating a short animated HTML promotional video using Tailwind CSS classes, one scene at a time, with a transition between each. Your work should look like something from a top-tier product launch video or a Dribbble/Behance featured shot — NOT a generic template.

INTENT (already decided, do not redecide): ${intent}

${assets.length === 0 ? imageBlock : ""}

${lastVideoBlock}
${designSystemBlock}
${motionBlock}
${scenesBlock}

=========================
FORBIDDEN PATTERN — banned, do not produce this
=========================

DO NOT produce a centered flex column with a circular badge/icon at the top, a small uppercase eyebrow label below it, and a headline below that, all vertically stacked and center-aligned, on a diagonal gradient background. This exact layout has been generated repeatedly and is explicitly banned. If your first instinct is a circle avatar + centered heading, stop and pick a different archetype instead — asymmetric composition, image-led, a single large stat, or a card/panel-based layout.

=========================
STYLE REFERENCE REQUESTS — when the user names a specific app or brand to match
=========================

If the user asks to match a named app or brand's look (e.g. "like Duolingo", "Stripe-style", "Notion-like"), before writing any HTML, work out 4-5 CONCRETE visual traits of that brand: its actual color palette (not a generic gradient), its corner radius, its shadow/border style, its font weight, and any signature UI motif. Then build the composition using those actual traits, and let the named brand's real palette OVERRIDE the default BACKGROUND TONE bias below.

For "Duolingo-style" specifically: flat SATURATED colors (signature green, roughly #58CC02) on a light/white background — NOT a pastel gradient mesh. Thick (3-4px), slightly darker-shade borders on cards/buttons. Chunky rounded corners (16-24px). Bold rounded sans-serif type, often left-aligned or in distinct blocks rather than everything centered. Buttons look "pressable": solid fill with a darker-shade bottom border, no soft blur shadows. Progress bars, streak badges, XP counters are flat rectangular chips, not glassmorphism/backdrop-blur.

=========================
VISUAL DIRECTION — AVOID GENERIC OUTPUT
=========================

The most common failure mode is: a centered gradient background with stacked text and nothing else. AVOID THIS DEFAULT. Every scene should feel like a deliberate design decision, not a fallback template.

Before writing each scene's HTML, decide:
1. WHAT IS THE FOCAL POINT of this scene? An image (product/person/logo), a large number/stat, or a headline — pick ONE hero element per scene and build the composition around it. Do not give text and image equal, centered weight by default.
2. WHAT LAYOUT ARCHETYPE fits this scene's content? Vary your choice per scene.
3. IS THERE AN IMAGE TO USE? If available, it should almost always be a PROMINENT visual element — full-bleed, large, or asymmetrically placed.
4. DOES THE COMPOSITION HAVE DEPTH? Use layering rather than everything on one flat plane.
5. BACKGROUND TONE — favor LIGHT, soft, airy pastel mesh-gradients UNLESS the user named a specific brand/style reference (see STYLE REFERENCE REQUESTS above) or asked for something dark/moody/premium — those override this default.

=========================
MOTION DIRECTION — AVOID REPETITIVE ANIMATION
=========================

The most common motion failure is using "fade-up" on every single element. AVOID THIS. Within one scene:
- Use AT LEAST 2-3 different data-anim types across that scene's elements.
- Stagger data-anim-index thoughtfully to match the archetype's region order.
- Use data-anim-spring variety too — hero/focal elements can carry more energy (snappy, bouncy, elastic) while supporting text stays calmer (gentle).
- Consider ONE accent element per scene using rotate-in or pop with a bouncy/elastic spring.
- data-anim-loop (float/breathe/pulse-opacity) on at most ONE element per scene.

=========================
DATA VISUALIZATION — WHEN THE CONTENT IS A STAT, COMPARISON, OR TREND
=========================

If the user's request involves numbers, comparisons, growth, market share, rankings, region-by-region data, or "before/after" — a chart is the hero element, not decorative text. Never refuse or redirect. Build charts with pure inline SVG or CSS only:

BAR CHART: flex row/column of <div> bars, fixed Tailwind height/width or inline style="height: 72%", each its own data-anim element staggered by data-anim-index.

PIE / DONUT CHART: inline <svg> with <circle> elements using stroke-dasharray/stroke-dashoffset. circumference = 2 * π * r (r=40 → 251.2). Show percentage as a large centered number.

LINE / TREND CHART: inline <svg> with a single <polyline>/<path>, points plotted manually. Animate with data-anim="fade" plus data-anim-spring="gentle" on the <svg> itself.

RULES:
- Use only 2 colors max per chart, pulled from the active palette.
- Keep numbers plausible and consistent with what the user described.
- A chart counts as ONE hero focal element — don't also add a competing large headline.

=========================
UPLOADED USER ASSETS
=========================

The user uploaded the following assets:

${JSON.stringify(assets, null, 2)}

These assets are the highest priority visual resources.

MANDATORY RULES:

1. Uploaded assets ALWAYS take priority over stock images.
2. NEVER use Pexels, Unsplash, Pixabay, or any external image URL for a role that has an uploaded asset.
3. NEVER invent or hallucinate another image URL. You may ONLY use a URL that appears EXACTLY in UPLOADED USER ASSETS above or in AVAILABLE IMAGES above.
4. Every uploaded asset MUST appear at least once across the scenes unless the user's request explicitly says not to use it.
5. The <img> src MUST be the EXACT uploaded URL — copy it character-for-character. NEVER use a placeholder or bracketed/templated syntax.
6. Preserve the role of every uploaded asset.
7. Every scene's cardHtml MUST be a standard double-quoted JSON string on a SINGLE LINE with no literal line breaks. NEVER use triple quotes (""") — this is JSON, not Python.
8. data-anim, data-anim-index, and data-anim-spring MUST be separate HTML attributes — NEVER embedded inside the class attribute's string value.
9. NEVER invent animation class names like "animate-fade-up" — data-anim is the only animation mechanism.

CORRECT example:
<img src="https://example.com/photo.jpg" class="w-full h-full object-cover rounded-full" data-anim="fade-up" data-anim-index="0" data-anim-spring="gentle" />

INCORRECT example (NEVER do this):
<img src="https://example.com/photo.jpg" class="w-full h-full animate-fade-up data-anim-index="0" data-anim-spring="gentle" object-cover" />

Role usage:

- role = "product" → primary product image.
- role = "person" → main person/hero image.
- role = "logo" → company/app logo.
- role = "background" → background image.

If an uploaded asset exists for a role, DO NOT replace it with any stock image.

RULES FOR "new":

- Output exactly ${effectiveSceneCount} scene${effectiveSceneCount > 1 ? "s" : ""} as described in SCENE STRUCTURE above and exactly ${Math.max(effectiveSceneCount - 1, 0)} transition${Math.max(effectiveSceneCount - 1, 0) === 1 ? "" : "s"}.
- No JavaScript.
- No markdown.
- No explanation.
- Use Tailwind classes only.
- Each scene uses exactly one palette (same palette across all scenes unless told otherwise).
- Each scene uses exactly one layout archetype.
- Canvas is 1080×1080 per scene.
- Apply all motion rules — with the variety described in MOTION DIRECTION above.

RULES FOR "redesign":

- Modify ONLY the scene(s) or transitions the user references (or all of them if they ask for a global change).
- Always return the FULL scenes array and FULL transitions array either way — copy any untouched scene/transition through EXACTLY as given in EXISTING VIDEO above, character for character.
- Keep the same layout, palette and motion on untouched scenes unless explicitly asked to change them.

Respond ONLY with JSON, no markdown fences:

{
  "intent":"${intent}",
  "scenes":[
    ${sceneSchemaExample}
  ],
  "transitions":[
    ${transitionsSchemaExample}
  ]
}

USER REQUEST:

${user_message}
`;
}
const worker = new Worker('render-jobs', async (job) => {

    const { user_message, user_id, chatbot_id, ai_provider, ai_model, api_key, history, assets } = job.data;
    console.log('user_message', user_message);

    const cleanHistory = (history || []).map(({ role, content }) => ({
        role,
        content: content ?? ""
    }));

    const lastVideo = await get_video(chatbot_id);

    const intentPrompt = buildIntentPrompt({ user_message, lastVideo });

    const intentResponseText = await generateAIResponse({
        provider: ai_provider,
        model: ai_model,
        apiKey: api_key,
        messages: [...cleanHistory, { role: "user", content: intentPrompt }]
    });

    const intentParsed = parseJsonResponse(intentResponseText);

    if (!intentParsed || intentParsed.intent === "chat") {
        const reply = intentParsed?.reply || intentResponseText;
        await supabase.from("conversations").insert({
            message: reply, role: "assistant", id: user_id, chatbot_id, created_at: new Date().toISOString()
        });
        return { message: reply };
    }

const intent = intentParsed.intent;
    const sceneCount = [1, 2, 3].includes(intentParsed.sceneCount) ? intentParsed.sceneCount : 3;
    
    const { data: fetch_count, error: fetch_count_err } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user_id);

    if (fetch_count_err) {
        throw fetch_count_err;
    }

    const currentVideoReq = fetch_count?.[0]?.current_video_req || 0;

    if (currentVideoReq >= 6) {
        const reply = "You've used all of your video tokens. Please try again in 2 hours.";
        await supabase.from("conversations").insert({
            message: reply, role: "assistant", id: user_id, chatbot_id, created_at: new Date().toISOString()
        });
        return { message: reply };
    }

    const stockImages = await fetchStockImages(user_message);

const generationPrompt = buildGenerationPrompt({ intent, user_message, assets, stockImages, lastVideo, sceneCount });

    const content_text = await generateAIResponse({
        provider: ai_provider,
        model: ai_model,
        apiKey: api_key,
        messages: [...cleanHistory, { role: "user", content: generationPrompt }]
    });

    console.log('=== RAW AI RESPONSE START ===');
    console.log(content_text);
    console.log('=== RAW AI RESPONSE END ===');

    const parsed = parseJsonResponse(content_text);

    console.log(parsed, 'text');

    const scenesValid =
        parsed &&
        Array.isArray(parsed.scenes) &&
        parsed.scenes.length > 0 &&
        (intent !== "new" || parsed.scenes.length === sceneCount) &&
        parsed.scenes.every(s =>
            s &&
            s.cardHtml &&
            s.background &&
            isCardHtmlWellFormed(s.cardHtml) &&
            hasOnlyAllowedImageUrls(s.cardHtml, assets, stockImages)
        );
    if (!scenesValid) {
        const reply = "I had trouble generating that video. Could you rephrase your request?";
        await supabase.from("conversations").insert({
            message: reply, role: "assistant", id: user_id, chatbot_id, created_at: new Date().toISOString()
        });
        return { message: reply };
    }

    const nextCount = currentVideoReq + 1;

    const scenes = parsed.scenes.map(s => {
        const resolvedPalette = paletteByKey(s.background);
        return {
            role: s.role,
            background: s.background,
            backgroundValue: resolvedPalette.background,
            cardHtml: s.cardHtml,
            durationInFrames: s.durationInFrames || 90,
        };
    });

    const transitions = Array.isArray(parsed.transitions) && parsed.transitions.length === scenes.length - 1
        ? parsed.transitions
        : Array(Math.max(scenes.length - 1, 0)).fill({ type: "crossfade" });

    const videoData = { scenes, transitions };

    const jobId = generateSixDigitNumber();
    const outputPath = await renderVideo({ jobId, videoData });

    const fileBuffer = fs.readFileSync(outputPath);
    const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(`${jobId}.mp4`, fileBuffer, { contentType: "video/mp4" });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(`${jobId}.mp4`);

    await supabase.from("conversations").insert({
        message: urlData.publicUrl,
        role: "assistant",
        id: user_id,
        chatbot_id: chatbot_id,
        video_data: videoData,
        created_at: new Date().toISOString()
    });

    await supabase.from("profiles")
        .update({ current_video_req: nextCount })
        .eq("id", user_id);

    return { jobId, videoUrl: urlData.publicUrl };

}, {
    connection,
    concurrency: 3
});

worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} done`, result);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});