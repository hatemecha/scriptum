/**
 * Punto de enganche para acento personalizado (p. ej. ajustes con cuenta).
 * Hoy los valores por defecto viven en `src/styles/globals.css` (:root y tema oscuro).
 *
 * Implementación futura típica: leer preferencia del usuario, validar hex, y en el cliente
 * asignar en `document.documentElement` las mismas custom properties que ya consume la UI
 * (`--color-accent`, `--color-accent-strong`, sombras y botón primario, etc.).
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
