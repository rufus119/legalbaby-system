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
        dashboard: "1320px",
      },
      colors: {
        background: "#05070A",
        card: "#0B1020",
        surface: "#11182B",
        primary: "#FF6A00",
        secondary: "#FF9D45",
        success: "#19F08B",
        danger: "#FF5A77",
        text: {
          primary: "#F7F8FA",
          secondary: "#95A1B5",
        },
      },
      boxShadow: {
        glass: "0 18px 60px rgba(0, 0, 0, 0.46)",
        glow: "0 0 0 1px rgba(255, 106, 0, 0.2), 0 18px 60px rgba(255, 106, 0, 0.14)",
        card: "0 12px 36px rgba(0, 0, 0, 0.42)",
      },
      borderRadius: {
        xl2: "18px",
        xl3: "18px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 106, 0, 0.0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255, 106, 0, 0.12)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
