import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

import { explainSceneHeadingParse, looksLikeSceneHeading } from "./scene-heading-detect";

export type ScreenplayContextHintInput = {
  blockType: ScreenplayBlockType;
  /** Texto completo del bloque activo */
  lineText: string;
};

/**
 * Una sola pista corta según el bloque y el texto; null si no hace falta molestar.
 */
export function resolveScreenplayContextHint(input: ScreenplayContextHintInput): string | null {
  const { blockType, lineText } = input;
  const text = lineText;
  const trimmed = text.trim();

  if (blockType === "scene-heading") {
    if (trimmed.length === 0) {
      return "Encabezado: INT., EXT., INT./EXT. o EST., lugar, un guion largo ( - ) y el momento (NOCHE, DÍA…).";
    }
    const parsed = explainSceneHeadingParse(text);
    if (!parsed.ok) {
      return parsed.hint;
    }
    return null;
  }

  if (blockType === "action" && looksLikeSceneHeading(text)) {
    return "Esa línea parece un encabezado: cambiá a bloque Encabezado o pulsá Tab hasta Encabezado para que cuente como escena nueva.";
  }

  if (blockType === "character") {
    if (trimmed.length === 0) {
      return "Nombre del hablante en MAYÚSCULAS; debajo va el diálogo. Extensiones como O.S. o V.O. van entre paréntesis si las usás.";
    }
    const upper = trimmed.toUpperCase();
    if (upper.includes("O.S.") && upper.includes("V.O.")) {
      return "O.S. = se oye fuera de plano; V.O. = voz en off (narración u otro recurso). No son intercambiables.";
    }
    if (upper.includes("O.S.")) {
      return "O.S. (off-screen): el personaje habla desde fuera del encuadre; se oye en el espacio de la escena.";
    }
    if (upper.includes("V.O.")) {
      return "V.O. (voice-over): narración o voz superpuesta; no implica que el personaje esté en plano.";
    }
    if (trimmed === trimmed.toLowerCase() && /[a-záéíóúñ]/.test(trimmed)) {
      return "Convención: el nombre del personaje en la línea de personaje suele ir en MAYÚSCULAS.";
    }
    return null;
  }

  if (blockType === "dialogue") {
    if (trimmed.length === 0) {
      return "Diálogo: va bajo el nombre del personaje, más estrecho que la acción; la siguiente línea suele ser acción u otro personaje.";
    }
    return null;
  }

  if (blockType === "parenthetical") {
    if (trimmed.length === 0) {
      return "Paréntesis: acotación breve bajo el nombre (tono o gesto). Mejor pocas líneas; lo importante va en acción.";
    }
    return null;
  }

  if (blockType === "transition") {
    if (trimmed.length === 0) {
      return "Transición: fórmulas como CUT TO: o FADE OUT. suelen ir al margen derecho en guiones clásicos; hoy muchos guiones las omiten.";
    }
    return null;
  }

  if (blockType === "action" && /\b(MONTAGE|MONTAJE)\b/i.test(text)) {
    return "MONTAGE: secuencia de planos breves; describí imágenes concretas en presente. INTERCUT alterna líneas sin repetir encabezado.";
  }

  if (blockType === "action" && /\bINTERCUT\b/i.test(text)) {
    return "INTERCUT: indica cortes entre dos hilos en paralelo; evita un encabezado nuevo en cada salto si el lector sigue el hilo.";
  }

  return null;
}
