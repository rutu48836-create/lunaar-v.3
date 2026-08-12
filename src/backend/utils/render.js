import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const remotionRoot = path.join(__dirname, "..", "remotion");

let bundleLocationPromise = null;

function getBundleLocation() {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({
      entryPoint: path.join(remotionRoot, "index.ts"),
    });
  }
  return bundleLocationPromise;
}

const DEFAULT_SCENE_DURATION = 90;
const DEFAULT_TRANSITION_DURATION = 15;
const MIN_TOTAL_DURATION = 300;

function computeTotalDuration(scenes, transitions) {
  const sceneTotal = scenes.reduce(
    (sum, s) => sum + (s.durationInFrames || DEFAULT_SCENE_DURATION),
    0
  );
  const overlapTotal = transitions.reduce(
    (sum, t) => sum + (t?.type === "cut" ? 0 : (t?.durationInFrames || DEFAULT_TRANSITION_DURATION)),
    0
  );
  return Math.max(sceneTotal - overlapTotal, MIN_TOTAL_DURATION);
}

function scaleScenesToMinDuration(scenes, transitions, minFrames) {
  const overlapTotal = transitions.reduce(
    (sum, t) => sum + (t?.type === "cut" ? 0 : (t?.durationInFrames || DEFAULT_TRANSITION_DURATION)),
    0
  );

  const sceneTotal = scenes.reduce(
    (sum, s) => sum + (s.durationInFrames || DEFAULT_SCENE_DURATION),
    0
  );

  const currentTotal = sceneTotal - overlapTotal;
  if (currentTotal >= minFrames) return scenes;

  const neededSceneTotal = minFrames + overlapTotal;
  const scale = neededSceneTotal / sceneTotal;

  return scenes.map(s => ({
    ...s,
    durationInFrames: Math.round((s.durationInFrames || DEFAULT_SCENE_DURATION) * scale),
  }));
}

function normalizeVideoData(videoData) {
  if (videoData?.scenes?.length) {
    const rawTransitions = videoData.transitions?.length === videoData.scenes.length - 1
      ? videoData.transitions
      : Array(Math.max(videoData.scenes.length - 1, 0)).fill({ type: "crossfade" });

    const scenes = scaleScenesToMinDuration(videoData.scenes, rawTransitions, MIN_TOTAL_DURATION);

    return { scenes, transitions: rawTransitions };
  }

  return {
    scenes: [
      {
        background: videoData?.background,
        backgroundValue: videoData?.backgroundValue,
        cardHtml: videoData?.cardHtml,
        durationInFrames: Math.max(videoData?.durationInFrames || 150, MIN_TOTAL_DURATION),
      },
    ],
    transitions: [],
  };
}

export async function renderVideo({
  jobId,
  videoData,
  width = 1080,
  height = 1080,
  fps = 30,
}) {
  const bundleLocation = await getBundleLocation();

  const { scenes, transitions } = normalizeVideoData(videoData);
  const durationInFrames = computeTotalDuration(scenes, transitions);

  const inputProps = {
    scenes,
    transitions,
    jobId,
    width,
    height,
    fps,
    durationInFrames,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "Renderer",
    inputProps,
  });

  const outputDir = path.join(remotionRoot, "out");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${jobId}.mp4`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    chromeMode: "chrome-for-testing",
    timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => {
      console.log(`[Job ${jobId}] Rendering progress: ${(progress * 100).toFixed(0)}%`);
    },
  });

  return outputPath;
}