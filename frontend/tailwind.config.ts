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
        background: "rgb(var(--bg-rgb) / <alpha-value>)",
        card: "rgb(var(--card-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        text: {
          primary: "rgb(var(--text-primary-rgb) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
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
