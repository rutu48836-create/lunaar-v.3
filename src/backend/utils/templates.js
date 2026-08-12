
export const TEMPLATES = {
    "centered-card": {
        description: "A centered glass card with headline, subtext, and optional badge. Best for announcements, offers, general messages.",
        requiredFields: ["headline"],
        optionalFields: ["subtext", "badge"],
        build: ({ headline, subtext, badge, colors }) => ({
            background: colors.background,
            elements: [
                {
                    type: "rect", x: "center", y: "center", width: 900, height: 500, zIndex: 1,
                    style: { fill: colors.cardFill, radius: 28, border: colors.cardBorder, shadow: "0 25px 60px rgba(0,0,0,0.12)" },
                    animation: { type: "fadeIn", start: 0, duration: 20 }
                },
                ...(badge ? [{
                    type: "rect", x: "center", y: 330, width: 160, height: 36, zIndex: 2,
                    style: { fill: colors.accent, radius: 999 },
                    animation: { type: "fadeIn", start: 6, duration: 15 }
                }, {
                    type: "text", content: badge, x: "center", y: 339, zIndex: 3,
                    style: { fontSize: 14, fontWeight: 600, color: "#ffffff" },
                    animation: { type: "fadeIn", start: 8, duration: 15 }
                }] : []),
                {
                    type: "text", content: headline, x: "center", y: 420, zIndex: 2,
                    style: { fontSize: 60, fontWeight: 700, color: colors.ink },
                    animation: { type: "slideUp", start: 12, duration: 25, fromY: 30, toY: 0 }
                },
                ...(subtext ? [{
                    type: "text", content: subtext, x: "center", y: 500, zIndex: 2,
                    style: { fontSize: 22, fontWeight: 500, color: colors.muted },
                    animation: { type: "fadeIn", start: 22, duration: 20 }
                }] : [])
            ]
        })
    },

    "stat-hero": {
        description: "A giant number/stat with a small label above and below. Best for discounts, percentages, cashback, quantities.",
        requiredFields: ["statValue", "statLabel"],
        optionalFields: ["eyebrow"],
        build: ({ statValue, statLabel, eyebrow, colors }) => ({
            background: colors.background,
            elements: [
                {
                    type: "rect", x: "center", y: "center", width: 800, height: 560, zIndex: 1,
                    style: { fill: colors.cardFill, radius: 32, shadow: "0 25px 60px rgba(0,0,0,0.12)" },
                    animation: { type: "fadeIn", start: 0, duration: 20 }
                },
                ...(eyebrow ? [{
                    type: "text", content: eyebrow, x: "center", y: 350, zIndex: 2,
                    style: { fontSize: 20, fontWeight: 600, color: colors.accent },
                    animation: { type: "fadeIn", start: 6, duration: 15 }
                }] : []),
                {
                    type: "text", content: statValue, x: "center", y: 420, zIndex: 2,
                    style: { fontSize: 110, fontWeight: 800, color: colors.ink },
                    animation: { type: "scale", start: 10, duration: 20, from: 0.8, to: 1 }
                },
                {
                    type: "text", content: statLabel, x: "center", y: 560, zIndex: 2,
                    style: { fontSize: 24, fontWeight: 500, color: colors.muted },
                    animation: { type: "fadeIn", start: 25, duration: 20 }
                }
            ]
        })
    },

    "split-image": {
        description: "Image on one side, headline + text on the other. Best when a real image URL is available and content benefits from visual context.",
        requiredFields: ["headline", "imageUrl"],
        optionalFields: ["subtext"],
        build: ({ headline, subtext, imageUrl, colors }) => ({
            background: colors.background,
            elements: [
                {
                    type: "image", url: imageUrl, x: 60, y: "center", width: 460, height: 700, zIndex: 1,
                    style: { radius: 24, objectFit: "cover", shadow: "0 20px 50px rgba(0,0,0,0.15)" },
                    animation: { type: "fadeIn", start: 0, duration: 20 }
                },
                {
                    type: "text", content: headline, x: 580, y: 420, zIndex: 2,
                    style: { fontSize: 52, fontWeight: 700, color: colors.ink, maxWidth: 440, wrap: true },
                    animation: { type: "slideUp", start: 12, duration: 25, fromY: 30, toY: 0 }
                },
                ...(subtext ? [{
                    type: "text", content: subtext, x: 580, y: 520, zIndex: 2,
                    style: { fontSize: 20, fontWeight: 500, color: colors.muted, maxWidth: 440, wrap: true },
                    animation: { type: "fadeIn", start: 22, duration: 20 }
                }] : [])
            ]
        })
    },

    "quote-card": {
        description: "Large centered quote text, minimal decoration. Best for testimonials, mottos, short sayings.",
        requiredFields: ["quote"],
        optionalFields: ["attribution"],
        build: ({ quote, attribution, colors }) => ({
            background: colors.background,
            elements: [
                {
                    type: "rect", x: "center", y: "center", width: 850, height: 450, zIndex: 1,
                    style: { fill: colors.cardFill, radius: 24, shadow: "0 20px 50px rgba(0,0,0,0.1)" },
                    animation: { type: "fadeIn", start: 0, duration: 20 }
                },
                {
                    type: "text", content: `"${quote}"`, x: "center", y: 420, zIndex: 2,
                    style: { fontSize: 38, fontWeight: 600, color: colors.ink, maxWidth: 700, wrap: true, textAlign: "center" },
                    animation: { type: "fadeIn", start: 10, duration: 25 }
                },
                ...(attribution ? [{
                    type: "text", content: `— ${attribution}`, x: "center", y: 520, zIndex: 2,
                    style: { fontSize: 20, fontWeight: 500, color: colors.muted },
                    animation: { type: "fadeIn", start: 30, duration: 20 }
                }] : [])
            ]
        })
    }
};

export const COLOR_PALETTES = {
    warm: {
        background: { type: "linear", angle: 160, stops: [{ color: "#fdf6f0", offset: 0 }, { color: "#f9e4d4", offset: 1 }] },
        cardFill: "rgba(255,255,255,0.88)",
        cardBorder: "1px solid rgba(0,0,0,0.06)",
        ink: "#1a1a1a",
        muted: "#6b6b6b",
        accent: "#e76f51"
    },
    cool: {
        background: { type: "linear", angle: 160, stops: [{ color: "#f0f4fd", offset: 0 }, { color: "#e2e8f9", offset: 1 }] },
        cardFill: "rgba(255,255,255,0.88)",
        cardBorder: "1px solid rgba(0,0,0,0.06)",
        ink: "#1a1a2a",
        muted: "#5f6b8a",
        accent: "#4361ee"
    },
    festive: {
        background: { type: "linear", angle: 160, stops: [{ color: "#fff5eb", offset: 0 }, { color: "#ffe0d1", offset: 1 }] },
        cardFill: "rgba(255,255,255,0.9)",
        cardBorder: "1px solid rgba(0,0,0,0.05)",
        ink: "#2b1a12",
        muted: "#7a5c4a",
        accent: "#d62828"
    }
};
