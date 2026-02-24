import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1cb0f6",
        "primary-dark": "#1cb0f6",
        "primary-light": "#eef4ff",
        "background-light": "#ffffff",
        "background-subtle": "#f6f6f8",
        "text-main": "#0d121b",
        "text-muted": "#4c669a",
        "border-light": "#e7ebf3",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-merriweather)", "Merriweather", "serif"],
      },
      borderRadius: {
        "2xl": "1.2rem",
        "3xl": "1.6rem",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(13, 18, 27, 0.08)",
        card: "0 8px 24px rgba(28, 176, 246, 0.12)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        riseIn: "riseIn 0.45s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
