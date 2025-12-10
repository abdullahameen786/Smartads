import React, { useState, createContext } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    // Add mode property for easier use in Navbar
    mode: isDark ? "dark" : "light",
    toggleTheme,
    colors: isDark
      ? {
          primary: "#00D9FF",
          secondary: "#7C3AED",
          accent: "#EC4899",

          // UPDATED BACKGROUNDS (based on #000053)
          bg1: "#000053",
          bg2: "#0A0A73", // lighter shade
          bg3: "#1A1A9A", // soft deep indigo

          cardBg: "rgba(0, 0, 83, 0.65)", // matching the new tone
          text1: "#E0E7FF",
          text2: "#C7D2FE",
          border: "rgba(0, 217, 255, 0.35)",
          // Additional colors for interaction
          success: "#4ade80",
          error: "#f87171",
        }
      : {
          primary: "#0088CC",
          secondary: "#6B21A8",
          accent: "#DB2777",
          bg1: "#F8FAFC",
          bg2: "#E2E8F0",
          bg3: "#CBD5E1",
          cardBg: "rgba(255, 255, 255, 0.95)",
          text1: "#1E293B",
          text2: "#475569",
          border: "rgba(0, 136, 204, 0.2)",
          // Additional colors for interaction
          success: "#10b981",
          error: "#ef4444",
        },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);