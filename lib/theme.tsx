import React, { createContext, useContext } from "react";
import { TextStyle, ViewStyle } from "react-native";

type Theme = {
  colors: {
    bg: string;
    surface: string;
    primary: string;
    onPrimary: string;
    border: string;
    text: string;
    subtext: string;
  };
  radius: number;
  spacing: (n: number) => number;
  card: ViewStyle;
  h1: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
};

const ThemeCtx = createContext<Theme>(null as any);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t: Theme = {
    colors: {
      bg: "#ffffff",
      surface: "#f9f9fb",
      primary: "#c6b1e6",
      onPrimary: "#1a1a1f",
      border: "#eeeeee",
      text: "#15151a",
      subtext: "#667085",
    },
    radius: 12,
    spacing: (n) => n * 8,
    card: { padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, backgroundColor: "#fff" },
    h1: { fontSize: 22, fontWeight: "700", color: "#15151a" },
    button: { backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 },
    buttonText: { textAlign: "center", fontWeight: "700", color: "#1a1a1f" },
  };
  return <ThemeCtx.Provider value={t}>{children}</ThemeCtx.Provider>;
};
export const useTheme = () => useContext(ThemeCtx);
