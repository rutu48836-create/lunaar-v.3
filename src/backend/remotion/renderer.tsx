import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import parse, { domToReact } from "html-react-parser";
import { install } from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind";

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadDMSerifDisplay } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

import { entranceStyle, exitStyle, TIMING } from "./motionSystem";

loadInter();
loadPlayfairDisplay();
loadSpaceGrotesk();
loadDMSerifDisplay();
loadPoppins();
loadJetBrainsMono();

let twindInstalled = false;
function ensureTwind() {
  if (twindInstalled) return;
  try {
    install({
      presets: [presetAutoprefix(), presetTailwind()],
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "sans-serif"],
            serif: ["Playfair Display", "serif"],
            display: ["DM Serif Display", "serif"],
            grotesk: ["Space Grotesk", "sans-serif"],
            poppins: ["Poppins", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"],
          },
        },
      },
    });
    twindInstalled = true;
  } catch (e) {
    twindInstalled = true;
  }
}

function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<img([^>]*)src="(?!https:\/\/)[^"]*"/gi, '<img$1src=""');
}

function resolveFill(fill) {
  if (!fill) return "transparent";
  if (typeof fill === "string") return fill;
  if (fill.type === "linear") {
    const angle = fill.angle ?? 180;
    const stops = (fill.stops || [])
      .map((s) => `${s.color} ${s.offset != null ? s.offset * 100 + "%" : ""}`.trim())
      .join(", ");
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  if (fill.type === "radial") {
    const stops = (fill.stops || [])
      .map((s) => `${s.color} ${s.offset != null ? s.offset * 100 + "%" : ""}`.trim())
      .join(", ");
    return `radial-gradient(circle, ${stops})`;
  }
  return "transparent";
}

// HTML void elements — these can never receive a children prop in React,
// not even undefined/empty array. Passing children on these throws
// "Minified React error #137".
const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Walks the parsed HTML tree and animates any element carrying `data-anim`.
 * Expected attributes on LLM-generated markup:
 *   data-anim="fade-up" | "fade-scale" | "slide-left" | "slide-right" | "fade"
 *   data-anim-index="0"        (stagger order within its sibling group; LLM sets this per CARD_ARCHETYPES.regions order)
 *   data-anim-spring="gentle" | "snappy" | "bouncy" | "stiff"   (optional, defaults to "gentle")
 * Elements without data-anim render as-is (untouched, e.g. wrapper divs).
 */
function useAnimatedReplace({ frame, fps, baseDelay, durationInFrames, withExit }) {
  return (domNode) => {
    if (domNode.type !== "tag" || !domNode.attribs) return undefined;
    const animType = domNode.attribs["data-anim"];
    if (!animType) return undefined;

    const index = parseInt(domNode.attribs["data-anim-index"] || "0", 10);
    const springPreset = domNode.attribs["data-anim-spring"] || "gentle";

    const enter = entranceStyle({
      frame,
      fps,
      index,
      type: animType,
      baseDelay,
      springPreset,
    });

    const exit = withExit && durationInFrames
      ? exitStyle({ frame, durationInFrames, type: "fade" })
      : { opacity: 1 };

    const style = {
      opacity: Math.min(enter.opacity, exit.opacity),
      transform: enter.transform,
    };

    // Strip the data-anim* attributes so they don't leak into the DOM as unknown props,
    // and re-render children through domToReact so nested tags still get parsed normally.
    const { "data-anim": _a, "data-anim-index": _b, "data-anim-spring": _c, ...rest } = domNode.attribs;
    const Tag = domNode.name;

    // Void elements (img, br, hr, etc.) must never receive a children prop —
    // React throws error #137 even for an empty/undefined children value.
    if (VOID_ELEMENTS.has(Tag)) {
      return <Tag {...rest} style={style} />;
    }

    return (
      <Tag {...rest} style={style}>
        {domNode.children && domToReact(domNode.children)}
      </Tag>
    );
  };
}

const DEFAULT_SCENE_DURATION = 90; // ~3s @ 30fps, used only if a scene omits durationInFrames
const DEFAULT_TRANSITION_DURATION = 15; // ~0.5s @ 30fps

/**
 * A single scene's visuals — this is exactly what the old Renderer used to do
 * for the whole video. Now it renders ONE scene inside a TransitionSeries.Sequence.
 *
 * IMPORTANT: `durationInFrames` here must be the SCENE's own duration, passed
 * explicitly as a prop — NOT read from useVideoConfig(), because inside a
 * Sequence, useVideoConfig() still reports the *global* composition duration,
 * which would make exit fades trigger at the end of the whole video instead
 * of the end of this scene.
 */
const Scene = ({ background, cardHtml, durationInFrames, animEntranceDelay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureTwind();
    setReady(true);
  }, []);

  // Container still gets a subtle overall settle so nothing pops in at full size instantly.
  const containerEntrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.9 },
  });
  const containerOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const containerScale = interpolate(containerEntrance, [0, 1], [0.98, 1]);

  const safeHtml = sanitizeHtml(cardHtml);

  const replace = useAnimatedReplace({
    frame,
    fps,
    baseDelay: animEntranceDelay + 6, // small lead-in so container settle reads first
    durationInFrames,
    withExit: true,
  });

  return (
    <AbsoluteFill style={{ background: resolveFill(background) }}>
      {ready && (
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: containerOpacity,
            transform: `scale(${containerScale})`,
          }}
        >
          {parse(safeHtml, { replace })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Maps a transition "type" string (from the LLM's output / stored videoData)
// to an @remotion/transitions presentation. "cut" returns null on purpose —
// a hard cut means no Transition node between scenes at all.
function getPresentation(type) {
  switch (type) {
    case "slide-left":
      return slide({ direction: "from-right" });
    case "slide-right":
      return slide({ direction: "from-left" });
    case "wipe":
      return wipe();
    case "cut":
      return null;
    case "crossfade":
    default:
      return fade();
  }
}

/**
 * Renderer now supports two shapes of props:
 *
 * 1. NEW multi-scene shape: { scenes: [...], transitions: [...] }
 * 2. OLD single-scene shape: { background, cardHtml } — kept working so
 *    older rows in Supabase's video_data column (saved before this change)
 *    still render correctly if ever re-rendered.
 */
export const Renderer = ({
  background,
  cardHtml,
  scenes: scenesProp,
  transitions: transitionsProp,
  animEntranceDelay = 0,
}) => {
  const { durationInFrames: videoDuration } = useVideoConfig();

  const scenes = scenesProp && scenesProp.length
    ? scenesProp
    : [{ background, cardHtml, durationInFrames: videoDuration }];

  const transitions = transitionsProp && transitionsProp.length === scenes.length - 1
    ? transitionsProp
    : Array(Math.max(scenes.length - 1, 0)).fill({ type: "crossfade" });

  // Single scene — no TransitionSeries needed at all.
  if (scenes.length === 1) {
    const only = scenes[0];
    return (
      <Scene
        background={only.background}
        cardHtml={only.cardHtml}
        durationInFrames={only.durationInFrames || videoDuration}
        animEntranceDelay={animEntranceDelay}
      />
    );
  }

  const children = scenes.flatMap((scene, i) => {
    const sceneDuration = scene.durationInFrames || DEFAULT_SCENE_DURATION;

    const sequence = (
      <TransitionSeries.Sequence key={`scene-${i}`} durationInFrames={sceneDuration}>
        <Scene
          background={scene.background}
          cardHtml={scene.cardHtml}
          durationInFrames={sceneDuration}
          animEntranceDelay={animEntranceDelay}
        />
      </TransitionSeries.Sequence>
    );

    // Last scene has no trailing transition.
    if (i === transitions.length) return [sequence];

    const t = transitions[i] || { type: "crossfade" };
    const presentation = getPresentation(t.type);
    const transitionDuration = t.durationInFrames || DEFAULT_TRANSITION_DURATION;

    // "cut" → no Transition node, scenes just hard-cut back to back.
    if (!presentation) return [sequence];

    return [
      sequence,
      <TransitionSeries.Transition
        key={`transition-${i}`}
        presentation={presentation}
        timing={linearTiming({ durationInFrames: transitionDuration })}
      />,
    ];
  });

  return <TransitionSeries>{children}</TransitionSeries>;
};