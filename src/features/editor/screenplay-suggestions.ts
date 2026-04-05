import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

export type ScreenplaySuggestionOption = {
  label: string;
  value: string;
};

export type ScreenplaySuggestionResult = {
  replaceFrom: number;
  replaceTo: number;
  options: ScreenplaySuggestionOption[];
  /** Tras insertar la sugerencia, fijar el tipo de bloque (p. ej. acción → encabezado). */
  finalizeBlockType?: ScreenplayBlockType;
};

const SCENE_TIMES: ScreenplaySuggestionOption[] = [
  { label: "DÍA", value: "DÍA" },
  { label: "NOCHE", value: "NOCHE" },
  { label: "MAÑANA", value: "MAÑANA" },
  { label: "TARDE", value: "TARDE" },
  { label: "ANOCHECER", value: "ANOCHECER" },
  { label: "AMANECER", value: "AMANECER" },
  { label: "MÁS TARDE", value: "MÁS TARDE" },
  { label: "MOMENTOS DESPUÉS", value: "MOMENTOS DESPUÉS" },
  { label: "CONTINUACIÓN", value: "CONTINUACIÓN" },
  { label: "AHORA", value: "AHORA" },
  { label: "LUEGO", value: "LUEGO" },
];

const CHARACTER_EXTENSIONS: ScreenplaySuggestionOption[] = [
  { label: "V.O.", value: "V.O." },
  { label: "O.S.", value: "O.S." },
  { label: "O.C.", value: "O.C." },
  { label: "SUBTÍTULO", value: "SUBTÍTULO" },
  { label: "A CONTINUACIÓN", value: "A CONTINUACIÓN" },
];

const TRANSITION_PHRASES: ScreenplaySuggestionOption[] = [
  { label: "CUT TO:", value: "CUT TO:" },
  { label: "FADE IN:", value: "FADE IN:" },
  { label: "FADE OUT.", value: "FADE OUT." },
  { label: "DISOLVE A:", value: "DISOLVE A:" },
  { label: "MATCH CUT TO:", value: "MATCH CUT TO:" },
  { label: "INTERCUT:", value: "INTERCUT:" },
];

function normalizePrefix(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase();
}

function filterByPrefix(
  options: ScreenplaySuggestionOption[],
  partial: string,
): ScreenplaySuggestionOption[] {
  if (partial.length === 0) {
    return options;
  }
  const p = normalizePrefix(partial);
  return options.filter((o) => normalizePrefix(o.value).startsWith(p));
}

function compactLetters(s: string): string {
  return normalizePrefix(s.replace(/[^A-Za-zÀ-ÿ]/g, ""));
}

function filterByCuePrefix(
  options: ScreenplaySuggestionOption[],
  partial: string,
): ScreenplaySuggestionOption[] {
  if (partial.length === 0) {
    return options;
  }
  const p = compactLetters(partial);
  if (p.length === 0) {
    return options;
  }
  return options.filter((o) => compactLetters(o.value).startsWith(p));
}

function isIntExtToken(token: string): boolean {
  const u = token.toUpperCase();
  return (
    u === "I" ||
    u === "IN" ||
    u === "INT" ||
    u === "INT." ||
    u === "INT/" ||
    u === "INT/E" ||
    u === "INT/EX" ||
    u === "E" ||
    u === "EX" ||
    u === "EXT" ||
    u === "EXT."
  );
}

function lastWordStart(beforeCursor: string, cursorOffset: number): number {
  const slice = beforeCursor.slice(0, cursorOffset);
  const i = slice.search(/\S+$/);
  return i === -1 ? cursorOffset : i;
}

function trailingToken(beforeCursor: string, cursorOffset: number): string {
  const slice = beforeCursor.slice(0, cursorOffset);
  const m = slice.match(/\S+$/);
  return m ? m[0] : "";
}

function intExtSluglineCompletion(
  beforeCursor: string,
  cursorOffset: number,
): { replaceFrom: number; replaceTo: number; options: ScreenplaySuggestionOption[] } | null {
  const token = trailingToken(beforeCursor, cursorOffset);
  if (!isIntExtToken(token)) {
    return null;
  }
  const tokenStart = lastWordStart(beforeCursor, cursorOffset);
  const u = token.toUpperCase();
  const options: ScreenplaySuggestionOption[] = [];
  if (u.startsWith("I")) {
    options.push({ label: "INT.", value: "INT." });
    options.push({ label: "INT./EXT.", value: "INT./EXT." });
  }
  if (u.startsWith("E") && !u.startsWith("I")) {
    options.push({ label: "EXT.", value: "EXT." });
    options.push({ label: "INT./EXT.", value: "INT./EXT." });
  }
  if (options.length === 0) {
    return null;
  }
  const filtered = options.filter((o) =>
    normalizePrefix(o.value).startsWith(normalizePrefix(token)),
  );
  if (filtered.length === 0) {
    return { replaceFrom: tokenStart, replaceTo: cursorOffset, options };
  }
  return { replaceFrom: tokenStart, replaceTo: cursorOffset, options: filtered };
}

/**
 * Contextual slugline / character / transition completions (professional conventions, Spanish UI labels).
 */
export function resolveScreenplaySuggestions(
  blockType: ScreenplayBlockType,
  beforeCursor: string,
  cursorOffset: number,
): ScreenplaySuggestionResult | null {
  if (cursorOffset < 0 || cursorOffset > beforeCursor.length) {
    return null;
  }

  const head = beforeCursor.slice(0, cursorOffset);

  if (blockType === "scene-heading") {
    const dashIdx = head.lastIndexOf(" - ");
    if (dashIdx !== -1) {
      const rawAfter = head.slice(dashIdx + 3);
      const partial = rawAfter.trimStart();
      const leading = rawAfter.length - rawAfter.trimStart().length;
      const partialStart = dashIdx + 3 + leading;
      const filtered = filterByPrefix(SCENE_TIMES, partial);
      if (filtered.length > 0) {
        return {
          replaceFrom: partialStart,
          replaceTo: cursorOffset,
          options: filtered,
        };
      }
    }

    return intExtSluglineCompletion(beforeCursor, cursorOffset);
  }

  if (blockType === "action") {
    const token = trailingToken(beforeCursor, cursorOffset);
    if (beforeCursor !== token || !isIntExtToken(token)) {
      return null;
    }
    const built = intExtSluglineCompletion(beforeCursor, cursorOffset);
    if (!built) {
      return null;
    }
    return { ...built, finalizeBlockType: "scene-heading" };
  }

  if (blockType === "character") {
    const openIdx = head.lastIndexOf("(");
    const closeAfter = head.indexOf(")", openIdx + 1);
    if (openIdx === -1 || (closeAfter !== -1 && closeAfter < head.length - 1)) {
      return null;
    }
    if (closeAfter !== -1) {
      return null;
    }
    const raw = head.slice(openIdx + 1);
    const partial = raw.trimStart();
    const leading = raw.length - raw.trimStart().length;
    const partialStart = openIdx + 1 + leading;
    const filtered = filterByCuePrefix(CHARACTER_EXTENSIONS, partial);
    if (filtered.length === 0) {
      return null;
    }
    return {
      replaceFrom: partialStart,
      replaceTo: cursorOffset,
      options: filtered,
    };
  }

  if (blockType === "transition") {
    const token = trailingToken(beforeCursor, cursorOffset);
    if (token.length === 0) {
      return {
        replaceFrom: cursorOffset,
        replaceTo: cursorOffset,
        options: TRANSITION_PHRASES,
      };
    }
    const tokenStart = lastWordStart(beforeCursor, cursorOffset);
    const filtered = filterByCuePrefix(TRANSITION_PHRASES, token);
    if (filtered.length === 0) {
      return null;
    }
    return {
      replaceFrom: tokenStart,
      replaceTo: cursorOffset,
      options: filtered,
    };
  }

  return null;
}
