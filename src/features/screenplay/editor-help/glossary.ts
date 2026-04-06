import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

/** Rol de cada línea del mini-ejemplo: define estilo en el modal (Courier, alineación). */
export type GlossaryExampleRole =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition";

export type ScreenplayGlossaryExample = {
  rows: readonly { role: GlossaryExampleRole; text: string }[];
};

export type ScreenplayGlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  /** Fragmento visual opcional; se muestra en el modal del glosario. */
  example?: ScreenplayGlossaryExample;
};

const EX_FORMAT_OVERVIEW = {
  rows: [
    { role: "scene-heading" as const, text: "EXT. CIUDAD - NOCHE" },
    {
      role: "action" as const,
      text: "Llovizna borra los neones. Un taxi frena en charco.",
    },
    { role: "character" as const, text: "CONDUCTOR" },
    { role: "dialogue" as const, text: "Subí. No hay tiempo." },
  ] satisfies ScreenplayGlossaryExample["rows"],
} satisfies ScreenplayGlossaryExample;

const EX_SCENE_SLUG = {
  rows: [
    { role: "scene-heading" as const, text: "INT. DEPÓSITO ABANDONADO - NOCHE" },
    {
      role: "action" as const,
      text: "Lluvia golpea la chapa. Una linterna recorta siluetas entre cajas apiladas.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_INT = {
  rows: [
    { role: "scene-heading" as const, text: "INT. ASCENSOR - DÍA" },
    {
      role: "action" as const,
      text: "Las puertas se cierran. Paula suelta el aire que venía conteniendo.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_EXT = {
  rows: [
    { role: "scene-heading" as const, text: "EXT. PLAYA - AMANECER" },
    { role: "action" as const, text: "Las gaviotas cruzan la línea del horizonte." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_INT_EXT = {
  rows: [
    {
      role: "scene-heading" as const,
      text: "INT./EXT. FURGÓN EN MOVIMIENTO - DÍA",
    },
    {
      role: "action" as const,
      text: "Pablo abre la puerta trasera; el paisaje urbano se desliza al fondo.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_ACTION = {
  rows: [
    {
      role: "action" as const,
      text: "La cerradura gira. Nadie respira. La puerta se abre un dedo.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_CHARACTER = {
  rows: [
    { role: "character" as const, text: "LUCÍA" },
    { role: "dialogue" as const, text: "Si salís ahora, no vuelvas por acá." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_DIALOGUE = {
  rows: [
    { role: "character" as const, text: "RAÚL" },
    {
      role: "dialogue" as const,
      text: "No vine a discutir. Vine a llevarme lo que es mío.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_PARENTHETICAL = {
  rows: [
    { role: "character" as const, text: "MARCOS" },
    { role: "parenthetical" as const, text: "(revolviendo la salsa, sin mirarla)" },
    {
      role: "dialogue" as const,
      text: "Mañana decimos la verdad o seguimos mintiéndonos nosotros.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_TRANSITION_CUT = {
  rows: [
    { role: "action" as const, text: "Marcos atraviesa el umbral." },
    { role: "transition" as const, text: "CORTE A:" },
    { role: "scene-heading" as const, text: "INT. AUTO - CONTINUACIÓN" },
    {
      role: "action" as const,
      text: "El motor arranca antes de que cierre la puerta.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_FADE_IN = {
  rows: [
    { role: "transition" as const, text: "FADE IN:" },
    { role: "scene-heading" as const, text: "INT. ESTUDIO - DÍA" },
    {
      role: "action" as const,
      text: "Polvo baila en un haz de sol. Julián levanta la vista del teclado.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_FADE_OUT = {
  rows: [
    {
      role: "action" as const,
      text: "La ciudad se apaga ventana a ventana hasta quedar en silencio.",
    },
    { role: "transition" as const, text: "FADE OUT." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_OS = {
  rows: [
    { role: "character" as const, text: "VIGILANCIA (O.S.)" },
    { role: "dialogue" as const, text: "Cámara tres, movimiento en pasillo." },
    { role: "action" as const, text: "Ana congela el paso bajo la luz mortecina." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_VO = {
  rows: [
    { role: "action" as const, text: "Imágenes de archivo: la plaza el día del pronunciamiento." },
    { role: "character" as const, text: "NARRACIÓN (V.O.)" },
    {
      role: "dialogue" as const,
      text: "Nadie supo entonces que sería la última vez.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_CONTD = {
  rows: [
    { role: "character" as const, text: "FELIPE" },
    {
      role: "dialogue" as const,
      text: "Abro la puerta y el pasillo huele a tabaco viejo.",
    },
    { role: "action" as const, text: "Un interruptor crepita. La luz tarda en estabilizarse." },
    { role: "character" as const, text: "FELIPE (CONT'D)" },
    { role: "dialogue" as const, text: "Y ahí, al fondo, sigue la sombra." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_SUPER = {
  rows: [
    {
      role: "action" as const,
      text: "SUPER: BUENOS AIRES — MARZO 1998",
    },
    {
      role: "action" as const,
      text: "Un tren a la deriva bajo cielo gris. Gente apretada en el andén.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_MONTAGE = {
  rows: [
    { role: "action" as const, text: "MONTAGE - EL PLAN TOMA FORMA" },
    { role: "action" as const, text: "— Manos marcan un mapa con tachones rojos." },
    { role: "action" as const, text: "— Una llave inglesa aprieta un tornillo hasta el límite." },
    { role: "action" as const, text: "— La linterna del celular ilumina un pasaje sellado." },
    { role: "action" as const, text: "— Click. La maleta queda cerrada." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_INTERCUT = {
  rows: [
    {
      role: "action" as const,
      text: "INTERCUT: llamada en manos libres + escalera de incendios mojada.",
    },
    { role: "scene-heading" as const, text: "INT. AUTO - NOCHE" },
    { role: "character" as const, text: "LEO (en el auto)" },
    { role: "dialogue" as const, text: "No llego si no apurás." },
    { role: "scene-heading" as const, text: "EXT. PATÍO INTERIOR - NOCHE" },
    { role: "character" as const, text: "INES (en el patio)" },
    { role: "dialogue" as const, text: "Ya está. Salí." },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_SCENE_UNITS = {
  rows: [
    { role: "scene-heading" as const, text: "INT. COMISARÍA - DÍA" },
    { role: "action" as const, text: "Papeles, café frío, el ruido de un ventilador colgando." },
    { role: "scene-heading" as const, text: "EXT. COMISARÍA - MOMENTOS DESPUÉS" },
    {
      role: "action" as const,
      text: "El mismo calor, pero afuera: sirenas lejanas devoran el silencio.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_PAGE_MINUTE = {
  rows: [
    { role: "scene-heading" as const, text: "INT. HABITACIÓN - NOCHE" },
    {
      role: "action" as const,
      text: "Cuatro párrafos densos de acción pueden comer pantalla; un monólogo largo también.",
    },
    { role: "character" as const, text: "SOFÍA" },
    {
      role: "dialogue" as const,
      text: "Una página no siempre es un minuto exacto, pero sirve para estimar.",
    },
  ],
} satisfies ScreenplayGlossaryExample;

const EX_BEAT = {
  rows: [
    {
      role: "action" as const,
      text: "Elena deja el sobre sobre la mesa. Una pausa. Sus dedos aún lo rozan.",
    },
    { role: "character" as const, text: "TOMÁS" },
    { role: "dialogue" as const, text: "Eso es todo lo que trajiste." },
  ],
} satisfies ScreenplayGlossaryExample;

function glossaryExampleSearchText(example: ScreenplayGlossaryExample | undefined): string {
  if (!example) {
    return "";
  }
  return example.rows.map((row) => row.text).join(" ");
}

const BLOCK_TYPE_TO_GLOSSARY_ID: Record<ScreenplayBlockType, string> = {
  "scene-heading": "scene-heading",
  action: "action",
  character: "character",
  dialogue: "dialogue",
  parenthetical: "parenthetical",
  transition: "transition",
};

/**
 * Glosario breve alineado con los bloques V1 de Scriptum y términos habituales de formato.
 * Referencias generales: guías de formato profesional (p. ej. StudioBinder, No Film School).
 */
export const SCREENPLAY_GLOSSARY_ENTRIES: readonly ScreenplayGlossaryEntry[] = [
  {
    id: "screenplay-format",
    term: "Formato de guion",
    definition:
      "Convenciones de margen, tipo de letra y bloques que permiten estimar duración y producir el documento sin reinterpretar cada línea.",
    example: EX_FORMAT_OVERVIEW,
  },
  {
    id: "scene-heading",
    term: "Encabezado de escena (slugline)",
    definition:
      "Línea en mayúsculas que ubica la escena: interior o exterior (INT./EXT.), el lugar y el momento (día, noche, amanecer…). Marca el inicio de cada escena nueva.",
    example: EX_SCENE_SLUG,
  },
  {
    id: "slugline",
    term: "Slugline",
    definition:
      "Nombre inglés del encabezado de escena: una sola línea que dice dónde y cuándo ocurre la escena (p. ej. INT. CASA - NOCHE).",
    example: EX_SCENE_SLUG,
  },
  {
    id: "int-slug",
    term: "INT.",
    definition:
      "Interior: la acción ocurre dentro de un espacio cerrado (casa, coche con techo, avión…). Suele ir seguido del lugar y del tiempo tras un guion.",
    example: EX_INT,
  },
  {
    id: "ext-slug",
    term: "EXT.",
    definition:
      "Exterior: la acción ocurre al aire libre o en un espacio abierto (calle, plaza, campo…). Formato igual que INT.: lugar y momento.",
    example: EX_EXT,
  },
  {
    id: "intext-slug",
    term: "INT./EXT. e INT/EXT.",
    definition:
      "Indica que la escena pasa del interior al exterior (o mezcla ambos) en continuidad, sin nuevo encabezado. También se ve como INT/EXT. según el guion.",
    example: EX_INT_EXT,
  },
  {
    id: "action",
    term: "Acción",
    definition:
      "Descripción de lo que ve y oye el espectador, en presente y en tercera persona. Sin opiniones del guionista ni lectura de intenciones internas que no se muestren.",
    example: EX_ACTION,
  },
  {
    id: "character",
    term: "Personaje",
    definition:
      "Nombre del hablante en mayúsculas, centrado respecto al diálogo, justo antes de sus líneas.",
    example: EX_CHARACTER,
  },
  {
    id: "dialogue",
    term: "Diálogo",
    definition:
      "Lo que dice el personaje en voz alta. Suele ir estrecho y centrado bajo el nombre.",
    example: EX_DIALOGUE,
  },
  {
    id: "parenthetical",
    term: "Paréntesis",
    definition:
      "Acotación breve sobre cómo decir una línea o una micro-acción mientras habla (uso moderado; no sustituye a la acción).",
    example: EX_PARENTHETICAL,
  },
  {
    id: "transition",
    term: "Transición",
    definition:
      "Indicación de montaje al margen derecho (p. ej. CORTE A:, FUNDIDO A NEGRO). En guiones contemporáneos se usan con mesura.",
    example: EX_TRANSITION_CUT,
  },
  {
    id: "cut-to",
    term: "CUT TO:",
    definition:
      "Corte seco a otra imagen o escena. En guiones clásicos iba al margen derecho; hoy muchos guiones omiten transiciones obvias.",
    example: EX_TRANSITION_CUT,
  },
  {
    id: "fade-in",
    term: "FADE IN:",
    definition:
      "Suele abrir el guion o una sección: la imagen emerge desde negro (o blanco). Empareja a veces con FADE OUT. al cerrar.",
    example: EX_FADE_IN,
  },
  {
    id: "fade-out",
    term: "FADE OUT.",
    definition:
      "La imagen se disuelve a negro (o blanco), marcando fin de secuencia o acto. El punto final es convención habitual en inglés.",
    example: EX_FADE_OUT,
  },
  {
    id: "os-cue",
    term: "O.S. (off-screen)",
    definition:
      "El personaje habla desde fuera del plano (se oye pero no se ve en cámara). No implica narración: es otra voz en el espacio de la escena.",
    example: EX_OS,
  },
  {
    id: "vo-cue",
    term: "V.O. (voice-over)",
    definition:
      "Voz en off que no tiene por qué ser un personaje visible: narración, carta leída, pensamiento en voz si el tono lo permite. Se distingue de O.S.",
    example: EX_VO,
  },
  {
    id: "contd",
    term: "CONT'D",
    definition:
      "Abreviatura de «continued»: el mismo personaje sigue hablando tras un párrafo de acción intercalado, o el diálogo continúa en la página siguiente.",
    example: EX_CONTD,
  },
  {
    id: "super",
    term: "SUPER:",
    definition:
      "Indica texto superpuesto en pantalla (título en pantalla, lugar, fecha, rótulo). Va en acción o nota de producción según el criterio del guion.",
    example: EX_SUPER,
  },
  {
    id: "montage",
    term: "MONTAGE",
    definition:
      "Serie de imágenes breves que condensan tiempo o progreso; a veces se rotula en acción o como secuencia. El ritmo lo marca la dirección en rodaje.",
    example: EX_MONTAGE,
  },
  {
    id: "intercut",
    term: "INTERCUT",
    definition:
      "Alternar entre dos (o más) líneas de acción en paralelo sin repetir encabezado en cada corte; se anuncia con INTERCUT: o en acción clara.",
    example: EX_INTERCUT,
  },
  {
    id: "scene",
    term: "Escena",
    definition:
      "Unidad narrativa entre dos encabezados. Cambiar de escena implica nuevo slugline.",
    example: EX_SCENE_UNITS,
  },
  {
    id: "page-minute",
    term: "Página ≈ un minuto",
    definition:
      "Regla orientativa de la industria: una página con formato estándar suele corresponder aproximadamente a un minuto de pantalla; varía con diálogo denso o acción pura.",
    example: EX_PAGE_MINUTE,
  },
  {
    id: "beat",
    term: "Beat",
    definition:
      "Pausa o giro mínimo dentro de una escena (mirada, silencio, revelación breve). No es un bloque aparte: anota ritmo entre líneas de acción o diálogo.",
    example: EX_BEAT,
  },
];

function normalizeForGlossarySearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Búsqueda insensible a mayúsculas y acentos en término, definición e id. */
export function filterGlossaryEntriesBySearch(
  query: string,
  entries: readonly ScreenplayGlossaryEntry[] = SCREENPLAY_GLOSSARY_ENTRIES,
): ScreenplayGlossaryEntry[] {
  const raw = query.replace(/\s+/g, " ").trim();
  if (raw.length === 0) {
    return [...entries];
  }
  const q = normalizeForGlossarySearch(raw);
  return entries.filter((entry) => {
    const haystack = normalizeForGlossarySearch(
      `${entry.term} ${entry.definition} ${entry.id} ${glossaryExampleSearchText(entry.example)}`,
    );
    return haystack.includes(q);
  });
}

export function getGlossaryEntryById(id: string): ScreenplayGlossaryEntry | undefined {
  return SCREENPLAY_GLOSSARY_ENTRIES.find((entry) => entry.id === id);
}

export function getGlossaryEntryForBlockType(
  blockType: ScreenplayBlockType,
): ScreenplayGlossaryEntry | undefined {
  return getGlossaryEntryById(BLOCK_TYPE_TO_GLOSSARY_ID[blockType]);
}
