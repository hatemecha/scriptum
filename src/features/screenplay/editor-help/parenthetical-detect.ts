/**
 * Línea de paréntesis tipo wrylie / acotación entre parlamentos.
 * Debe ser una sola línea con contenido entre paréntesis, sin sub-paréntesis.
 */

export function looksLikeParentheticalLine(text: string): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 3) {
    return false;
  }
  if (!t.startsWith("(") || !t.endsWith(")")) {
    return false;
  }
  const inner = t.slice(1, -1).trim();
  if (inner.length === 0) {
    return false;
  }
  if (inner.includes("(") || inner.includes(")")) {
    return false;
  }
  return true;
}
