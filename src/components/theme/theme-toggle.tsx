"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/cn";
import type { ThemePreference } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  /** Called after the theme switches (e.g. persist to profile). */
  onAfterThemeChange?: (next: ThemePreference) => void;
};

export function ThemeToggle({ className, onAfterThemeChange }: ThemeToggleProps) {
  const { resolvedTheme, themePreference, setThemePreference } = useTheme();
  const nextThemeLabel = resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  function handleToggle() {
    const nextTheme = themePreference === "dark" ? "light" : "dark";
    setThemePreference(nextTheme);
    onAfterThemeChange?.(nextTheme);
  }

  return (
    <button
      type="button"
      className={cn("theme-toggle", className)}
      onClick={handleToggle}
      aria-label={nextThemeLabel}
      aria-pressed={resolvedTheme === "dark"}
    >
      <span className="theme-toggle__glyph" aria-hidden="true">
        {resolvedTheme === "dark" ? "◐" : "◑"}
      </span>
      <span className="theme-toggle__label">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
