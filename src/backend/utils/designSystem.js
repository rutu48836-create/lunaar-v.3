// designSystem.js
// Fixed vocabulary for the LLM to pick from. Keeping this closed (not "make up any color")
// is what makes AI-generated cards look like one product instead of a random Tailwind grab-bag.

export const PALETTES = {
  warmEditorial: {
    key: "warmEditorial",
    background: "linear-gradient(160deg, #fdf6f0, #f3ddc4)",
    cardBg: "#fffaf3",
    textPrimary: "#241a12",
    textSecondary: "#8a7360",
    accent: "#d9752f",
    border: "#eaddca",
  },
  midnightGrotesk: {
    key: "midnightGrotesk",
    background: "linear-gradient(160deg, #0b0d12, #171b24)",
    cardBg: "#12151c",
    textPrimary: "#f5f6f8",
    textSecondary: "#8b93a3",
    accent: "#5ee6c8",
    border: "#242a36",
  },
  mono: {
    key: "mono",
    background: "#f4f4f2",
    cardBg: "#ffffff",
    textPrimary: "#111111",
    textSecondary: "#6b6b6b",
    accent: "#111111",
    border: "#e5e5e2",
  },
  vibrantPop: {
    key: "vibrantPop",
    background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
    cardBg: "#ffffff",
    textPrimary: "#1a1a1a",
    textSecondary: "#5c5c5c",
    accent: "#ff6b6b",
    border: "#f2f2f2",
  },
  pastelSoft: {
    key: "pastelSoft",
    background: "linear-gradient(160deg, #f0e8f9, #e2f1ea)",
    cardBg: "#fdfcfe",
    textPrimary: "#332b3d",
    textSecondary: "#8b7f97",
    accent: "#9b7edb",
    border: "#ece4f5",
  },
};

// Maps to the fonts already loaded in Renderer.jsx — keep this list in sync with the loaders there.
export const TYPE_SCALE = {
  display: { font: "font-display", classes: "text-6xl font-bold leading-tight tracking-tight" },
  heading: { font: "font-grotesk", classes: "text-4xl font-semibold leading-snug tracking-tight" },
  subheading: { font: "font-sans", classes: "text-2xl font-medium leading-snug" },
  body: { font: "font-sans", classes: "text-lg font-normal leading-relaxed" },
  caption: { font: "font-sans", classes: "text-sm font-medium uppercase tracking-widest" },
  mono: { font: "font-mono", classes: "text-base font-normal" },
};

export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64]; // px, Tailwind-aligned (1,2,3,4,6,8,12,16)
export const RADII = { sm: "rounded-lg", md: "rounded-2xl", lg: "rounded-3xl", full: "rounded-full" };
export const SHADOWS = { soft: "shadow-lg", lifted: "shadow-2xl", none: "shadow-none" };

// Layout archetypes: tells the LLM *where* content goes, not just what color to use.
// Each archetype names its regions in the order they should receive stagger delays.
export const CARD_ARCHETYPES = {
  quote: {
    description: "Large centered quote with attribution below",
    regions: ["quoteMark", "quoteText", "attribution"],
  },
  statHighlight: {
    description: "One big number/stat with a short label above and context line below",
    regions: ["eyebrow", "statNumber", "context"],
  },
  listReveal: {
    description: "A heading followed by 3-5 list items that reveal in sequence",
    regions: ["heading", "listItem1", "listItem2", "listItem3", "listItem4"],
  },
  comparison: {
    description: "Two side-by-side columns (before/after, us/them)",
    regions: ["heading", "columnLeft", "columnRight"],
  },
  testimonial: {
    description: "Optional avatar/image, quote, name + role",
    regions: ["image", "quoteText", "name", "role"],
  },
  cta: {
    description: "Headline, supporting line, and a visually prominent action label",
    regions: ["headline", "subline", "actionLabel"],
  },
};

export function paletteByKey(key) {
  return PALETTES[key] || PALETTES.warmEditorial;
}