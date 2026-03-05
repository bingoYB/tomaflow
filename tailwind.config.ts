import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Noto Sans", "Noto Sans Arabic", "sans-serif"]
      },
      boxShadow: {
        glow: "0 12px 40px rgba(239, 68, 68, 0.25)"
      },
      animation: {
        "panel-in": "panelIn 0.5s ease-out both"
      },
      keyframes: {
        panelIn: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
