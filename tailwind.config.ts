import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Saffron → amber: the warm accent. Punchier top end.
        saffron: {
          50: "#fff8ed", 100: "#ffefd3", 200: "#ffdba5", 300: "#ffc06d",
          400: "#ff9a33", 500: "#ff7a0d", 600: "#f05e06", 700: "#c74607",
          800: "#9e380e", 900: "#7f300f",
        },
        // Navy: near-ink primary. Deeper 900/950 for bold color blocks.
        navy: {
          50: "#f2f5f9", 100: "#e2e8f0", 200: "#c5d2e0", 300: "#97aed1",
          400: "#6286b6", 500: "#426798", 600: "#34517e", 700: "#2c4267",
          800: "#1a2b47", 900: "#0b1220", 950: "#060a14",
        },
        // Teal: fresh secondary accent for variety in tiles/badges.
        teal: {
          50: "#effcfb", 100: "#cbf6f4", 200: "#99ece9", 300: "#5cdbd8",
          400: "#22c3c0", 500: "#0ea5a4", 600: "#078480", 700: "#0a6666",
          800: "#0d5151", 900: "#104343",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      fontSize: {
        // Tighter display tracking helpers for the bold revamp.
        "display-lg": ["3.25rem", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-md": ["2.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-sm": ["1.875rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(11,18,32,.05), 0 1px 3px rgba(11,18,32,.07)",
        "elevation-2": "0 4px 10px rgba(11,18,32,.07), 0 8px 20px rgba(11,18,32,.09)",
        "elevation-3": "0 8px 18px rgba(11,18,32,.1), 0 16px 40px rgba(11,18,32,.16)",
        // Colored glows for bold CTAs / active elements.
        "glow-saffron": "0 8px 24px rgba(255,122,13,.35)",
        "glow-saffron-lg": "0 12px 36px rgba(255,122,13,.45)",
        "glow-navy": "0 12px 36px rgba(11,18,32,.4)",
        "soft": "0 1px 0 rgba(11,18,32,.04), 0 2px 8px rgba(11,18,32,.04)",
        "ring-saffron": "0 0 0 4px rgba(255,122,13,.18)",
        "ring-teal": "0 0 0 4px rgba(14,165,164,.18)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shimmer-slow": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "rise": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".6" },
        },
        "blob": {
          "0%, 100%": { borderRadius: "42% 58% 63% 37% / 41% 44% 56% 59%" },
          "33%": { borderRadius: "67% 33% 47% 53% / 37% 62% 38% 63%" },
          "66%": { borderRadius: "38% 62% 56% 44% / 63% 37% 63% 37%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s infinite linear",
        "shimmer-slow": "shimmer-slow 3.5s infinite linear",
        "float": "float 3s ease-in-out infinite",
        "rise": "rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "blob": "blob 14s ease-in-out infinite",
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
