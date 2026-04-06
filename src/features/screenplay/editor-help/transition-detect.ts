const TRANSITION_RE =
  /^(?:CUT TO:|SMASH CUT TO:|MATCH CUT TO:|DISSOLVE TO:|FADE IN:|FADE OUT\.|WIPE TO:|INTERCUT:|BACK TO:|CONTINUED:)/;

export function looksLikeTransitionLine(text: string): boolean {
  const value = text.trim();
  if (value.length < 4) {
    return false;
  }
  return TRANSITION_RE.test(value.toUpperCase());
}

export function getTransitionAutoDetectReason(text: string): string | null {
  if (!looksLikeTransitionLine(text)) {
    return null;
  }
  return "Lo marcamos como transición: la línea empieza por una fórmula de montaje (CORTE, FUNDIDO, INTERCUT…).";
}
