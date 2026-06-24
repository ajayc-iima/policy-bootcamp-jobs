import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crimson mappings (replacing saffron)
        saffron: {
          50: "#fdf2f4", 100: "#fce2e7", 200: "#f8b9c6", 300: "#f18099",
          400: "#e43f62", 500: "#c5002f", 600: "#aa0029", 700: "#8e0022",
          800: "#73001c", 900: "#5a0016",
        },
        // Ink/Paper mappings (replacing navy)
        navy: {
          50: "#f2efe9", 100: "#e5e0d5", 200: "#d6cebe", 300: "#afa38e",
          400: "#8b7e67", 500: "#675a44", 600: "#4b4131", 700: "#352e22",
          800: "#201d19", 900: "#151413", 950: "#0e0d0c",
        },
        // Sage mappings (replacing teal)
        teal: {
          50: "#f6f8f5", 100: "#ecefe9", 200: "#d4dbd0", 300: "#b3c0ac",
          400: "#8fa187", 500: "#687c59", 600: "#596a4c", 700: "#4a583f",
          800: "#3b4632", 900: "#2c3426",
        },
        // Absolute custom brand variables
        ink: "#151413",
        paper: "#F2EFE9",
        crimson: "#C5002F",
        marigold: "#C88028",
        sage: "#687C59",
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        display: ["var(--font-newsreader)", "Georgia", "serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
      },
      fontSize: {
        // Tighter display tracking helpers for the bold revamp.
        "display-lg": ["3.25rem", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-md": ["2.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-sm": ["1.875rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(21,20,19,.05), 0 1px 3px rgba(21,20,19,.07)",
        "elevation-2": "0 4px 10px rgba(21,20,19,.07), 0 8px 20px rgba(21,20,19,.09)",
        "elevation-3": "0 8px 18px rgba(21,20,19,.1), 0 16px 40px rgba(21,20,19,.16)",
        // Crimson & Ink glows for buttons and cards
        "glow-saffron": "0 8px 24px rgba(197,0,47,.25)",
        "glow-saffron-lg": "0 12px 36px rgba(197,0,47,.35)",
        "glow-navy": "0 12px 36px rgba(21,20,19,.3)",
        "soft": "0 1px 0 rgba(21,20,19,.04), 0 2px 8px rgba(21,20,19,.04)",
        "ring-saffron": "0 0 0 4px rgba(197,0,47,.12)",
        "ring-teal": "0 0 0 4px rgba(104,124,89,.12)",
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
