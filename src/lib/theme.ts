export type ThemePreference = "dark" | "light";

export const THEME_STORAGE_KEY = "scriptum-theme";
export const THEME_COOKIE_NAME = "scriptum-theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "dark";

export function isThemePreference(
  value: string | null | undefined,
): value is ThemePreference {
  return value === "dark" || value === "light";
}
