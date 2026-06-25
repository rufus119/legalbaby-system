"use client";

import { createContext, useContext, useMemo } from "react";

type ThemeValue = {
  brandName: string;
  subtitle: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
  };
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeValue>(
    () => ({
      brandName: "LEGALBABY",
      subtitle: "Playlist Intelligence",
      colors: {
        primary: "#FF6A00",
        secondary: "#FF8E3C",
        background: "#05070B",
        card: "#09111F",
      },
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeConfig() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeConfig must be used within ThemeProvider");
  }
  return ctx;
}
