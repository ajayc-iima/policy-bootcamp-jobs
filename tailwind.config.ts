import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff8ed", 100: "#ffefd3", 200: "#ffdba5", 300: "#ffc06d",
          400: "#ff9a33", 500: "#ff7a0d", 600: "#f05e06", 700: "#c74607",
          800: "#9e380e", 900: "#7f300f",
        },
        navy: {
          50: "#f2f5f9", 100: "#e2e8f0", 200: "#c5d2e0", 300: "#97aed1",
          400: "#6286b6", 500: "#426798", 600: "#34517e", 700: "#2c4267",
          800: "#273858", 900: "#0f1f3a", 950: "#0a1424",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(15,31,58,.04), 0 1px 3px rgba(15,31,58,.06)",
        "elevation-2": "0 2px 6px rgba(15,31,58,.06), 0 4px 12px rgba(15,31,58,.08)",
        "elevation-3": "0 4px 12px rgba(15,31,58,.08), 0 8px 24px rgba(15,31,58,.12)",
        "glow-saffron": "0 0 20px rgba(255,122,13,.25)",
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
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s infinite linear",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
