"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const nextThemeLabel = resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      className={cn("theme-toggle", className)}
      onClick={toggleTheme}
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
