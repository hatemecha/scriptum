/**
 * Hook point for user-customizable accent color (e.g. from account preferences).
 * Default values live in `src/styles/globals.css` (:root and dark theme).
 *
 * Future implementation: read user preference, validate hex, and on the client
 * assign these custom properties on `document.documentElement` so the UI picks
 * them up (`--color-accent`, `--color-accent-strong`, shadows, primary button, etc.).
 */
export const ACCENT_CSS_VARIABLE_NAMES = [
  "--color-accent",
  "--color-accent-strong",
  "--color-accent-soft",
  "--color-accent-soft-strong",
  "--control-primary-start",
  "--control-primary-hover",
  "--control-primary-border",
  "--control-primary-shadow",
  "--color-focus-ring",
  "--color-focus-shadow",
  "--color-page-glow-1",
] as const;
