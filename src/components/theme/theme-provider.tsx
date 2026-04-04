"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { THEME_COOKIE_NAME, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

type ThemeContextValue = {
  resolvedTheme: ThemePreference;
  setThemePreference: (nextTheme: ThemePreference) => void;
  themePreference: ThemePreference;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme: ThemePreference;
};

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = themePreference;
    document.documentElement.style.colorScheme = themePreference;
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    document.cookie = `${THEME_COOKIE_NAME}=${themePreference}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [themePreference]);

  function setThemePreference(nextTheme: ThemePreference) {
    setThemePreferenceState(nextTheme);
  }

  function toggleTheme() {
    const nextTheme = themePreference === "dark" ? "light" : "dark";

    setThemePreference(nextTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        resolvedTheme: themePreference,
        setThemePreference,
        themePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
