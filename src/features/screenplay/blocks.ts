export const screenplayBlockTypes = [
  "scene-heading",
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
] as const;

export type ScreenplayBlockType = (typeof screenplayBlockTypes)[number];

export type ScreenplayBlockBoundary = ScreenplayBlockType | "document-start" | "document-end";

export interface ScreenplayBlockDefinition {
  type: ScreenplayBlockType;
  label: string;
  description: string;
  startsScene: boolean;
  allowedPrevious: readonly ScreenplayBlockBoundary[];
  allowedNext: readonly ScreenplayBlockBoundary[];
  notes: readonly string[];
}

export interface ExcludedScreenplayElementDefinition {
  label: string;
  reason: string;
  fallbackInV1: ScreenplayBlockType | "metadata" | "none";
}

export const screenplayBlockDefinitions = {
  "scene-heading": {
    type: "scene-heading",
    label: "Scene Heading",
    description: "Starts a new scene and defines the scene title used by navigation.",
    startsScene: true,
    allowedPrevious: ["document-start", "action", "dialogue", "transition"],
    allowedNext: ["action", "character"],
    notes: [
      "Canonical scene boundary in V1.",
      "Feeds the scene navigator and future scene indexing.",
    ],
  },
  action: {
    type: "action",
    label: "Action",
    description: "Describes visible or audible action outside spoken dialogue.",
    startsScene: false,
    allowedPrevious: ["document-start", "scene-heading", "action", "dialogue", "transition"],
    allowedNext: ["action", "character", "scene-heading", "transition", "document-end"],
    notes: [
      "Default general-purpose prose block for the screenplay body.",
      "Consecutive action blocks are valid.",
    ],
  },
  character: {
    type: "character",
    label: "Character",
    description: "Declares the current speaker for the dialogue that follows.",
    startsScene: false,
    allowedPrevious: ["scene-heading", "action", "dialogue", "transition"],
    allowedNext: ["dialogue", "parenthetical"],
    notes: [
      "Cannot stand alone in a valid saved document.",
      "A new character resets the active speaker.",
    ],
  },
  dialogue: {
    type: "dialogue",
    label: "Dialogue",
    description: "Stores spoken lines for the most recent active character.",
    startsScene: false,
    allowedPrevious: ["character", "parenthetical", "dialogue"],
    allowedNext: ["dialogue", "character", "action", "scene-heading", "transition", "document-end"],
    notes: [
      "Always belongs to the nearest preceding character.",
      "Consecutive dialogue blocks are valid and represent continued speech.",
    ],
  },
  parenthetical: {
    type: "parenthetical",
    label: "Parenthetical",
    description: "Stores a short cue inside a dialogue run.",
    startsScene: false,
    allowedPrevious: ["character", "dialogue"],
    allowedNext: ["dialogue"],
    notes: ["Only valid inside a character/dialogue flow.", "Cannot replace action paragraphs."],
  },
  transition: {
    type: "transition",
    label: "Transition",
    description: "Stores explicit manual editorial transitions.",
    startsScene: false,
    allowedPrevious: ["document-start", "action", "dialogue"],
    allowedNext: ["scene-heading", "action", "document-end"],
    notes: [
      "Manual and rare in the writing flow.",
      "May be used as opening or closing transition.",
    ],
  },
} as const satisfies Record<ScreenplayBlockType, ScreenplayBlockDefinition>;

export const excludedV1ScreenplayElements = [
  {
    label: "Folder",
    reason: "Outline/navigation grouping, not a screenplay body block.",
    fallbackInV1: "none",
  },
  {
    label: "Scene Description",
    reason: "Outline support, not part of the printable screenplay body.",
    fallbackInV1: "none",
  },
  {
    label: "Scene Characters",
    reason: "Useful for reports, but not required to write the screenplay body.",
    fallbackInV1: "none",
  },
  {
    label: "Shot",
    reason: "Adds directorial granularity and complexity outside the MVP.",
    fallbackInV1: "action",
  },
  {
    label: "Title",
    reason: "Needs special layout treatment outside the core body flow.",
    fallbackInV1: "action",
  },
  {
    label: "Lyrics",
    reason: "Needs special formatting and pagination rules outside the MVP.",
    fallbackInV1: "dialogue",
  },
  {
    label: "Note on the Text",
    reason: "Annotation, not screenplay body content.",
    fallbackInV1: "none",
  },
  {
    label: "Non-Printable Text",
    reason: "Creates hidden content and export ambiguity.",
    fallbackInV1: "none",
  },
  {
    label: "Dual Dialogue",
    reason: "Advanced layout feature, not a base screenplay body block.",
    fallbackInV1: "none",
  },
  {
    label: "Title Page Fields",
    reason: "Project metadata, not screenplay body blocks.",
    fallbackInV1: "metadata",
  },
] as const satisfies readonly ExcludedScreenplayElementDefinition[];

export function isScreenplayBlockType(value: string): value is ScreenplayBlockType {
  return screenplayBlockTypes.includes(value as ScreenplayBlockType);
}

export function getScreenplayBlockDefinition(type: ScreenplayBlockType): ScreenplayBlockDefinition {
  return screenplayBlockDefinitions[type];
}
