import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        dashboard: "1440px",
      },
      colors: {
        background: "#070B14",
        card: "#0F172A",
        primary: "#00E676",
        secondary: "#7C4DFF",
        accent: "#00C2FF",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
        },
      },
      boxShadow: {
        soft: "0 12px 32px rgba(2, 6, 23, 0.35)",
        lift: "0 16px 44px rgba(2, 6, 23, 0.44)",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "24px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
