import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0C0A09",
          raised: "#1C1917",
          soft: "#292524",
          hover: "#44403C",
        },
        accent: {
          DEFAULT: "#FF5E00",
          hover: "#FF7A2E",
          muted: "rgba(255, 94, 0, 0.12)",
          glow: "rgba(255, 94, 0, 0.25)",
        },
        amber: "#F59E0B",
        teal: "#0D9488",
        sand: {
          DEFAULT: "#A8A29E",
          light: "#D6D3D1",
          bright: "#FAFAF9",
        },
        stroke: "rgba(168, 162, 158, 0.15)",
        "stroke-accent": "rgba(255, 94, 0, 0.3)",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "monospace"],
      },
      letterSpacing: {
        stencil: "0.15em",
        wide: "0.06em",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
      },
      keyframes: {
        "enter": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "enter-scale": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        enter: "enter 0.5s ease-out both",
        "enter-scale": "enter-scale 0.4s ease-out both",
        shimmer: "shimmer 2s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
