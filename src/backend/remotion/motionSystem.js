// motionSystem.js
// Reusable motion vocabulary so every card animates with the same "hand," regardless of
// what the LLM designed. These are plain functions (no hooks) so they can be called from
// inside a render-prop / html-react-parser `replace` callback, not just top-level components.

import { spring, interpolate } from "remotion";

export const SPRINGS = {
  gentle: { damping: 18, stiffness: 90, mass: 1 },
  snappy: { damping: 20, stiffness: 200, mass: 0.7 },
  bouncy: { damping: 10, stiffness: 140, mass: 0.9 },
  stiff: { damping: 26, stiffness: 260, mass: 0.6 },
  elastic: { damping: 8, stiffness: 120, mass: 1.1 },
};

// Frame budget conventions (assuming 30fps; scale proportionally if not).
export const TIMING = {
  staggerStep: 6,        // frames between sibling elements
  gridStaggerStep: 3,    // frames between grid cells (finer than list stagger)
  entranceDuration: 18,  // frames for a single element's entrance
  exitLead: 20,          // frames before the end where exit animation begins
  loopPeriod: 90,        // frames for one cycle of an ambient/looping animation
};

/**
 * Computes style for a single element's entrance, given its index in a stagger group.
 * type: 'fade' | 'fade-up' | 'fade-down' | 'fade-scale' | 'fade-scale-down' |
 *       'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' |
 *       'rotate-in' | 'blur-in' | 'flip-in' | 'pop'
 */
export function entranceStyle({
  frame,
  fps,
  index = 0,
  type = "fade-up",
  baseDelay = 0,
  springPreset = "gentle",
}) {
  const delay = baseDelay + index * TIMING.staggerStep;
  const localFrame = Math.max(frame - delay, 0);

  const progress = spring({
    frame: localFrame,
    fps,
    config: SPRINGS[springPreset] || SPRINGS.gentle,
    durationInFrames: TIMING.entranceDuration,
  });

  const opacity = interpolate(localFrame, [0, TIMING.entranceDuration * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let transform = "none";
  let filter;

  switch (type) {
    case "fade-up":
      transform = `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`;
      break;
    case "fade-down":
      transform = `translateY(${interpolate(progress, [0, 1], [-24, 0])}px)`;
      break;
    case "fade-scale":
      transform = `scale(${interpolate(progress, [0, 1], [0.92, 1])})`;
      break;
    case "fade-scale-down":
      // "pop in from slightly oversized" — good for badges/logos
      transform = `scale(${interpolate(progress, [0, 1], [1.15, 1])})`;
      break;
    case "slide-left":
      transform = `translateX(${interpolate(progress, [0, 1], [40, 0])}px)`;
      break;
    case "slide-right":
      transform = `translateX(${interpolate(progress, [0, 1], [-40, 0])}px)`;
      break;
    case "slide-up":
      transform = `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`;
      break;
    case "slide-down":
      transform = `translateY(${interpolate(progress, [0, 1], [-60, 0])}px)`;
      break;
    case "rotate-in":
      transform = `rotate(${interpolate(progress, [0, 1], [-8, 0])}deg) scale(${interpolate(
        progress,
        [0, 1],
        [0.9, 1]
      )})`;
      break;
    case "flip-in":
      transform = `perspective(600px) rotateX(${interpolate(progress, [0, 1], [55, 0])}deg)`;
      break;
    case "blur-in":
      transform = `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`;
      filter = `blur(${interpolate(progress, [0, 1], [8, 0])}px)`;
      break;
    case "pop":
      // overshoots then settles — relies on bouncy/elastic spring preset for feel
      transform = `scale(${interpolate(progress, [0, 1], [0.5, 1])})`;
      break;
    case "fade":
    default:
      transform = "none";
  }

  return {
    opacity,
    transform,
    ...(filter ? { filter } : {}),
    willChange: "transform, opacity, filter",
  };
}

/**
 * Optional exit treatment for elements near the end of the card's on-screen duration.
 * type: 'fade' | 'fade-down' | 'fade-up' | 'scale-out' | 'slide-out-left' | 'slide-out-right' | 'blur-out'
 */
export function exitStyle({ frame, durationInFrames, type = "fade" }) {
  const start = durationInFrames - TIMING.exitLead;
  const opacity = interpolate(frame, [start, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  switch (type) {
    case "fade-down": {
      const y = interpolate(frame, [start, durationInFrames], [0, 16], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, transform: `translateY(${y}px)` };
    }
    case "fade-up": {
      const y = interpolate(frame, [start, durationInFrames], [0, -16], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, transform: `translateY(${y}px)` };
    }
    case "scale-out": {
      const s = interpolate(frame, [start, durationInFrames], [1, 0.92], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, transform: `scale(${s})` };
    }
    case "slide-out-left": {
      const x = interpolate(frame, [start, durationInFrames], [0, -40], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, transform: `translateX(${x}px)` };
    }
    case "slide-out-right": {
      const x = interpolate(frame, [start, durationInFrames], [0, 40], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, transform: `translateX(${x}px)` };
    }
    case "blur-out": {
      const b = interpolate(frame, [start, durationInFrames], [0, 6], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return { opacity, filter: `blur(${b}px)` };
    }
    case "fade":
    default:
      return { opacity };
  }
}

/**
 * Splits a text node into per-character or per-word spans for reveal animation.
 * Returns an array of { text, key } to map into spans in the calling component,
 * since motionSystem.js stays framework-render-agnostic (no JSX here).
 */
export function splitForReveal(text, mode = "word") {
  if (!text) return [];
  const parts = mode === "char" ? text.split("") : text.split(/(\s+)/).filter(Boolean);
  return parts.map((t, i) => ({ text: t, key: `${mode}-${i}` }));
}

// Container-level background transition (used by AbsoluteFill wrapper for palette swaps mid-card).
export function backgroundCrossfade({ frame, fps, switchAtFrame, durationFrames = 15 }) {
  return interpolate(
    frame,
    [switchAtFrame, switchAtFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

/**
 * Entrance helper for elements laid out in a grid (e.g. feature icons, product tiles).
 * Staggers by (row, col) distance from an origin corner instead of a flat index,
 * so reveal reads as a diagonal/radial sweep rather than a simple top-to-bottom list.
 */
export function gridEntranceStyle({
  frame,
  fps,
  row = 0,
  col = 0,
  type = "fade-scale",
  baseDelay = 0,
  springPreset = "snappy",
}) {
  const index = row + col; // diagonal sweep; swap for row*cols+col if you want row-major order
  return entranceStyle({
    frame,
    fps,
    index,
    type,
    baseDelay,
    springPreset,
  });
}

/**
 * Continuous, non-entrance ambient motion for elements that should feel "alive"
 * once settled — subtle floating, breathing scale, or slow glow pulse.
 * Use AFTER an element's entrance has completed (i.e. frame > entrance window).
 * kind: 'float' | 'breathe' | 'pulse-opacity'
 */
export function ambientLoop({ frame, kind = "float", amplitude = 6, period = TIMING.loopPeriod }) {
  const cycle = (frame % period) / period; // 0..1
  const wave = Math.sin(cycle * Math.PI * 2); // -1..1

  switch (kind) {
    case "breathe":
      return { transform: `scale(${1 + wave * (amplitude / 100)})` };
    case "pulse-opacity":
      return { opacity: 1 - Math.abs(wave) * (amplitude / 100) };
    case "float":
    default:
      return { transform: `translateY(${wave * amplitude}px)` };
  }
}

/**
 * Progress-driven reveal for SVG strokes (e.g. animated underline, icon draw-on).
 * Returns strokeDasharray/strokeDashoffset pair; pass pathLength if known, else
 * use a large constant and pair with vector-effect="non-scaling-stroke".
 */
export function pathDrawStyle({ frame, fps, pathLength = 300, baseDelay = 0, durationFrames = 24 }) {
  const localFrame = Math.max(frame - baseDelay, 0);
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - progress),
  };
}

/**
 * Numeric ticker/counter — animates a number counting up to its target value.
 * Returns the current displayed value (rounded); caller formats/inserts as text.
 */
export function countUpValue({ frame, fps, targetValue, baseDelay = 0, durationFrames = 30 }) {
  const localFrame = Math.max(frame - baseDelay, 0);
  const progress = interpolate(localFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = spring({ frame: localFrame, fps, config: SPRINGS.stiff, durationInFrames });
  return Math.round(targetValue * Math.max(progress, eased > 1 ? 1 : eased));
}