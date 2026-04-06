/**
 * Detección tolerante de sluglines (encabezados de escena) para auto-formato y ayudas.
 * Una sola fuente de verdad para prefijos INT./EXT./INT./EXT./EST. y variantes comunes.
 */

const MIN_SLUGLINE_LENGTH = 6;

type PrefixMatch = { end: number; kind: "int" | "ext" | "intext" | "est" | "ie" };

/** Orden: más específico primero. Requiere espacio o fin tras el prefijo para el cuerpo. */
const SLUG_PREFIX_RULES: ReadonlyArray<{ re: RegExp; kind: PrefixMatch["kind"] }> = [
  { re: /^INT\.\s*\/\s*EXT\.?\s+/i, kind: "intext" },
  { re: /^INT\s*\/\s*EXT\.?\s+/i, kind: "intext" },
  { re: /^EXT\.\s*\/\s*INT\.?\s+/i, kind: "intext" },
  { re: /^EXT\s*\/\s*INT\.?\s+/i, kind: "intext" },
  { re: /^I\s*\/\s*E\.?\s+/i, kind: "ie" },
  { re: /^EST\.?\s+/i, kind: "est" },
  { re: /^INT\.\s+/i, kind: "int" },
  { re: /^EXT\.\s+/i, kind: "ext" },
  { re: /^INT\s+/i, kind: "int" },
  { re: /^EXT\s+/i, kind: "ext" },
];

function matchSlugPrefix(normalized: string): PrefixMatch | null {
  for (const { re, kind } of SLUG_PREFIX_RULES) {
    const m = normalized.match(re);
    if (m && m[0]) {
      return { end: m[0].length, kind };
    }
  }
  return null;
}

/**
 * Corrige errores típicos al escribir el prefijo (p. ej. EXT.XT. en vez de EXT.).
 * Solo afecta al análisis / auto-formato, no reescribe el documento.
 */
export function applySlugTypoCorrections(raw: string): string {
  return raw
    .replace(/^EXT\.(?:[XT]\.?)+/i, "EXT. ")
    .replace(/^INT\.(?:[NT]\.?)+/i, "INT. ");
}

/** Normaliza espacios y guiones tipográficos para analizar el slugline. */
export function normalizeSluglineText(raw: string): string {
  return applySlugTypoCorrections(raw)
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True si la línea encaja en un encabezado de escena real (prefijo + al menos un poco de “lugar”).
 */
export function looksLikeSceneHeading(text: string): boolean {
  const normalized = normalizeSluglineText(text);
  if (normalized.length < MIN_SLUGLINE_LENGTH) {
    return false;
  }
  const prefix = matchSlugPrefix(normalized);
  if (!prefix) {
    return false;
  }
  const body = normalized.slice(prefix.end).trim();
  return body.length >= 1;
}

export type SceneHeadingParseResult =
  | { ok: true }
  | { ok: false; hint: string };

/**
 * Explica por qué algo no califica como slugline o sugiere mejora (sin modificar el documento).
 */
export function explainSceneHeadingParse(text: string): SceneHeadingParseResult {
  const normalized = normalizeSluglineText(text);
  if (normalized.length === 0) {
    return {
      ok: false,
      hint: "Un encabezado suele ser INT./EXT. o EST., lugar y tiempo (p. ej. INT. CASA - NOCHE).",
    };
  }

  if (looksLikeSceneHeading(text)) {
    return { ok: true };
  }

  const prefix = matchSlugPrefix(normalized);
  if (prefix) {
    const body = normalized.slice(prefix.end).trim();
    if (body.length === 0) {
      return {
        ok: false,
        hint: "Tras INT./EXT. o EST. añadí el lugar y, tras un guion, el momento (día, noche…).",
      };
    }
  }

  const upper = normalized.toUpperCase();
  if (/^INT|^EXT|^EST|^I\s*\/\s*E/.test(upper)) {
    return {
      ok: false,
      hint: "Parece un encabezado: dejá un espacio tras INT./EXT./EST. y usá mayúsculas; el tiempo suele ir tras « - ».",
    };
  }

  return {
    ok: false,
    hint: "Si es una nueva escena, probá el bloque Encabezado o escribí INT./EXT. seguido del lugar.",
  };
}

/** Mensaje corto para el pie de ayuda cuando el editor clasifica la línea como encabezado. */
export function getSceneHeadingAutoDetectReason(text: string): string | null {
  if (!looksLikeSceneHeading(text)) {
    return null;
  }
  const normalized = normalizeSluglineText(text);
  const prefix = matchSlugPrefix(normalized);
  if (!prefix) {
    return null;
  }
  switch (prefix.kind) {
    case "intext":
      return "Lo marcamos como encabezado: empieza por INT./EXT. (interior y exterior en la misma línea) y tiene lugar.";
    case "ie":
      return "Lo marcamos como encabezado: empieza por I/E (interior/exterior abreviado) y tiene lugar.";
    case "est":
      return "Lo marcamos como encabezado: empieza por EST. (plano de establecimiento) y describe el lugar.";
    case "int":
      return "Lo marcamos como encabezado: empieza por INT. (interior) y sigue con el lugar.";
    case "ext":
      return "Lo marcamos como encabezado: empieza por EXT. (exterior) y sigue con el lugar.";
    default:
      return "Lo marcamos como encabezado por el prefijo típico y el lugar en la misma línea.";
  }
}
