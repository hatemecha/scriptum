"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
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
        <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {resolvedTheme === "dark" ? (
            <path d="M8 1.5a6.5 6.5 0 0 0 0 13z" fill="currentColor" />
          ) : (
            <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
          )}
        </svg>
      </span>
      <span className="theme-toggle__label">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
