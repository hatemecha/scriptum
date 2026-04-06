import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import { formatScreenplayBlockText } from "@/features/screenplay/format-rules";
import { estimateScreenplayPageCount } from "@/features/screenplay/page-estimate";

export type PreviewBlock = {
  id: string;
  text: string;
  type: ScreenplayBlockType;
};

export type PreviewLine = {
  id: string;
  sceneId: string | null;
  text: string;
  type: ScreenplayBlockType;
};

export type PreviewProject = {
  author?: string;
  blocks: readonly PreviewBlock[];
  estimatedPages: number;
  id: string;
  lastEditedLabel: string;
  summary: string;
  title: string;
};

export type PreviewScene = {
  heading: string;
  id: string;
  indexLabel: string;
};

export type PreviewUser = {
  email: string;
  initials: string;
  name: string;
  plan: "Free" | "Premium";
};

function createInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

function createPageEstimate(blocks: readonly PreviewBlock[]): number {
  return estimateScreenplayPageCount(blocks);
}

function createProjectTitleFromId(projectId: string): string {
  const readableTitle = projectId
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

  return readableTitle || "Sin título";
}

function createProject(project: Omit<PreviewProject, "estimatedPages">): PreviewProject {
  return {
    ...project,
    estimatedPages: createPageEstimate(project.blocks),
  };
}

const silentEditorBlocks: readonly PreviewBlock[] = [
  {
    id: "blk-silent-scene-1",
    type: "scene-heading",
    text: "INT. COFFEE SHOP - DAY",
  },
  {
    id: "blk-silent-action-1",
    type: "action",
    text: "The room is quiet except for the scrape of a spoon against porcelain.",
  },
  {
    id: "blk-silent-character-1",
    type: "character",
    text: "LUCIA",
  },
  {
    id: "blk-silent-dialogue-1",
    type: "dialogue",
    text: "If the page stays calm, maybe I can stay calm too.",
  },
  {
    id: "blk-silent-scene-2",
    type: "scene-heading",
    text: "INT. HALLWAY - EVENING",
  },
  {
    id: "blk-silent-action-2",
    type: "action",
    text: "A strip of warm light cuts across the floor while footsteps pass behind the door.",
  },
  {
    id: "blk-silent-character-2",
    type: "character",
    text: "MATEO",
  },
  {
    id: "blk-silent-parenthetical-1",
    type: "parenthetical",
    text: "softly",
  },
  {
    id: "blk-silent-dialogue-2",
    type: "dialogue",
    text: "Leave the draft open. We will know what it needs when the noise is gone.",
  },
  {
    id: "blk-silent-scene-3",
    type: "scene-heading",
    text: "EXT. TERRACE - NIGHT",
  },
  {
    id: "blk-silent-action-3",
    type: "action",
    text: "The city below keeps moving. On the table, a single page waits under a glass of water.",
  },
  {
    id: "blk-silent-transition-1",
    type: "transition",
    text: "CUT TO:",
  },
] as const;

const unmarkedMorningBlocks: readonly PreviewBlock[] = [
  {
    id: "blk-morning-scene-1",
    type: "scene-heading",
    text: "EXT. BUS TERMINAL - MORNING",
  },
  {
    id: "blk-morning-action-1",
    type: "action",
    text: "Passengers drift across the platform with the heavy patience of people who woke before sunrise.",
  },
  {
    id: "blk-morning-character-1",
    type: "character",
    text: "INES",
  },
  {
    id: "blk-morning-dialogue-1",
    type: "dialogue",
    text: "No signs, no map, no speech. Just keep moving and trust the next turn.",
  },
  {
    id: "blk-morning-scene-2",
    type: "scene-heading",
    text: "INT. COACH BUS - LATER",
  },
  {
    id: "blk-morning-action-2",
    type: "action",
    text: "The seats vibrate softly as fields slide past the window in a long green blur.",
  },
  {
    id: "blk-morning-character-2",
    type: "character",
    text: "DRIVER",
  },
  {
    id: "blk-morning-dialogue-2",
    type: "dialogue",
    text: "If you are lost, that means you still have somewhere to arrive.",
  },
] as const;

const lateCallBlocks: readonly PreviewBlock[] = [
  {
    id: "blk-call-scene-1",
    type: "scene-heading",
    text: "INT. STUDIO - NIGHT",
  },
  {
    id: "blk-call-action-1",
    type: "action",
    text: "Red tally lights blink across the console while an unanswered phone fills the room with a patient ring.",
  },
  {
    id: "blk-call-character-1",
    type: "character",
    text: "ELENA",
  },
  {
    id: "blk-call-dialogue-1",
    type: "dialogue",
    text: "If this is the last call, let it sound like we meant to stay.",
  },
  {
    id: "blk-call-transition-1",
    type: "transition",
    text: "FADE OUT:",
  },
] as const;

export const previewUser: PreviewUser = {
  email: "lucia@scriptum.app",
  initials: createInitials("Lucia Vega"),
  name: "Lucia Vega",
  plan: "Free",
};

export const previewProjects: readonly PreviewProject[] = [
  createProject({
    author: previewUser.name,
    blocks: silentEditorBlocks,
    id: "the-silent-editor",
    lastEditedLabel: "hace 2 horas",
    summary: "Un guión sobre una página que exige silencio antes de dejarse terminar.",
    title: "The Silent Editor",
  }),
  createProject({
    author: "Ines Duarte",
    blocks: unmarkedMorningBlocks,
    id: "manana-sin-mapa",
    lastEditedLabel: "ayer",
    summary: "Una salida sin mapa que convierte cada desvío en una declaración.",
    title: "Mañana sin mapa",
  }),
  createProject({
    author: "Elena Costa",
    blocks: lateCallBlocks,
    id: "last-call",
    lastEditedLabel: "3 abr 2026",
    summary: "La última llamada de un estudio que no sabe si está a punto de cerrar o de empezar.",
    title: "Last Call",
  }),
] as const;

/**
 * Editor routes under `/projects/[id]` that are static prototypes (no `projects` row).
 * Real cloud projects use DB ownership checks instead.
 */
export const authenticatedEditorPrototypeProjectIds: readonly string[] = [
  ...previewProjects.map((project) => project.id),
  "sin-titulo",
];

const authenticatedEditorPrototypeIdSet = new Set(authenticatedEditorPrototypeProjectIds);

export function isAuthenticatedEditorPrototypeProjectId(projectId: string): boolean {
  return authenticatedEditorPrototypeIdSet.has(projectId);
}

export function getPreviewProject(projectId: string): PreviewProject {
  const matchingProject = previewProjects.find((project) => project.id === projectId);

  if (matchingProject) {
    return matchingProject;
  }

  return createProject({
    author: previewUser.name,
    blocks: [],
    id: projectId,
    lastEditedLabel: "ahora",
    summary: "Proyecto nuevo listo para empezar.",
    title: createProjectTitleFromId(projectId),
  });
}

export function getPreviewScenes(blocks: readonly PreviewBlock[]): PreviewScene[] {
  return blocks
    .filter((block) => block.type === "scene-heading")
    .map((block, index) => ({
      heading: formatScreenplayBlockText("scene-heading", block.text),
      id: block.id,
      indexLabel: `Escena ${String(index + 1).padStart(2, "0")}`,
    }));
}

export function getPreviewLines(blocks: readonly PreviewBlock[]): PreviewLine[] {
  let activeSceneId: string | null = null;

  return blocks.map((block) => {
    if (block.type === "scene-heading") {
      activeSceneId = block.id;
    }

    return {
      id: block.id,
      sceneId: activeSceneId,
      text: formatScreenplayBlockText(block.type, block.text),
      type: block.type,
    };
  });
}
