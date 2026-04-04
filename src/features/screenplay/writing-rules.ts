import {
  getScreenplayBlockDefinition,
  type ScreenplayBlockBoundary,
  type ScreenplayBlockType,
} from "@/features/screenplay/blocks";

export const screenplayStructuredClipboardMimeType =
  "application/x-scriptum-screenplay-blocks+json";

export const screenplaySingleLineBlockTypes = [
  "scene-heading",
  "character",
  "parenthetical",
  "transition",
] as const satisfies readonly ScreenplayBlockType[];

export interface ScreenplayBoundaryInsertionRule {
  enterCreates: ScreenplayBlockType;
  tabCreates: ScreenplayBlockType;
}

export interface ScreenplayEmptyBlockConversionRule {
  enterConvertsTo: ScreenplayBlockType;
  tabConvertsTo: ScreenplayBlockType;
  shiftTabConvertsTo: ScreenplayBlockType;
}

export interface ScreenplayClipboardBlock {
  type: ScreenplayBlockType;
  text: string;
}

export interface ScreenplayStructuredClipboardPayload {
  version: 1;
  blocks: readonly ScreenplayClipboardBlock[];
}

export const screenplayBoundaryInsertionRules = {
  "scene-heading": {
    enterCreates: "action",
    tabCreates: "character",
  },
  action: {
    enterCreates: "action",
    tabCreates: "character",
  },
  character: {
    enterCreates: "dialogue",
    tabCreates: "parenthetical",
  },
  dialogue: {
    enterCreates: "action",
    tabCreates: "character",
  },
  parenthetical: {
    enterCreates: "dialogue",
    tabCreates: "dialogue",
  },
  transition: {
    enterCreates: "scene-heading",
    tabCreates: "action",
  },
} as const satisfies Record<ScreenplayBlockType, ScreenplayBoundaryInsertionRule>;

export const screenplayEmptyBlockConversionRules = {
  "scene-heading": {
    enterConvertsTo: "action",
    tabConvertsTo: "character",
    shiftTabConvertsTo: "transition",
  },
  action: {
    enterConvertsTo: "character",
    tabConvertsTo: "character",
    shiftTabConvertsTo: "scene-heading",
  },
  character: {
    enterConvertsTo: "dialogue",
    tabConvertsTo: "parenthetical",
    shiftTabConvertsTo: "action",
  },
  dialogue: {
    enterConvertsTo: "action",
    tabConvertsTo: "character",
    shiftTabConvertsTo: "character",
  },
  parenthetical: {
    enterConvertsTo: "dialogue",
    tabConvertsTo: "dialogue",
    shiftTabConvertsTo: "character",
  },
  transition: {
    enterConvertsTo: "scene-heading",
    tabConvertsTo: "action",
    shiftTabConvertsTo: "action",
  },
} as const satisfies Record<ScreenplayBlockType, ScreenplayEmptyBlockConversionRule>;

export const screenplaySelectionPolicy = {
  supportedModes: ["caret", "inline-range", "block-range"] as const,
  allowsDiscontiguousSelection: false,
  allowsMultiCursor: false,
  requiresBlockRangeForStructuredClipboard: true,
  requiresBlockRangeForManualConversion: true,
} as const;

export const screenplayDeletionPolicy = {
  mergeAcrossBlocksOnBackspace: false,
  mergeAcrossBlocksOnDelete: false,
  backspaceAtFilledBlockStart: "move-caret-to-previous-block-end",
  deleteAtFilledBlockEnd: "move-caret-to-next-block-start",
  backspaceOnEmptyBlock: "remove-block",
  deleteOnEmptyBlock: "remove-block",
  emptyDocumentFallback: "action",
} as const;

export const screenplayManualConversionPolicy = {
  preservesTextByteForByte: true,
  trimsOrFormatsText: false,
  rejectsInlineSelections: true,
  rejectsInvalidAdjacency: true,
} as const;

export const screenplayDocumentRepairRules = [
  {
    when: "character-not-followed-by-dialogue-or-parenthetical",
    repairTo: "action",
  },
  {
    when: "dialogue-without-active-character",
    repairTo: "action",
  },
  {
    when: "parenthetical-outside-dialogue-run",
    repairTo: "action",
  },
  {
    when: "scene-heading-with-invalid-previous-block",
    repairTo: "action",
  },
  {
    when: "transition-with-invalid-context",
    repairTo: "action",
  },
] as const satisfies readonly {
  when: string;
  repairTo: ScreenplayBlockType;
}[];

export const screenplayTransitionParagraphs = [
  "FADE IN:",
  "FADE OUT.",
  "CUT TO:",
  "DISSOLVE TO:",
  "SMASH CUT TO:",
  "MATCH CUT TO:",
  "WIPE TO:",
] as const;

export const screenplaySceneHeadingPattern = /^(INT\.|EXT\.|EST\.|INT\/EXT\.|I\/E\.)\b/i;

export function isSingleLineScreenplayBlockType(
  type: ScreenplayBlockType,
): type is (typeof screenplaySingleLineBlockTypes)[number] {
  return screenplaySingleLineBlockTypes.includes(
    type as (typeof screenplaySingleLineBlockTypes)[number],
  );
}

export function normalizePlainTextForScreenplayPaste(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function isSceneHeadingPasteCandidate(text: string): boolean {
  return screenplaySceneHeadingPattern.test(text.trim());
}

export function isTransitionPasteCandidate(text: string): boolean {
  const trimmedText = text.trim();
  const uppercaseText = trimmedText.toUpperCase();

  if (
    screenplayTransitionParagraphs.includes(
      uppercaseText as (typeof screenplayTransitionParagraphs)[number],
    )
  ) {
    return true;
  }

  return uppercaseText === trimmedText && uppercaseText.endsWith("TO:");
}

export function isParentheticalPasteCandidate(
  text: string,
  previousBlockType: ScreenplayBlockBoundary,
): boolean {
  const trimmedText = text.trim();

  if (!trimmedText.startsWith("(") || !trimmedText.endsWith(")")) {
    return false;
  }

  return previousBlockType === "character" || previousBlockType === "dialogue";
}

export function isCharacterPasteCandidate(
  text: string,
  previousBlockType: ScreenplayBlockBoundary,
): boolean {
  const trimmedText = text.trim();

  if (trimmedText.length === 0 || trimmedText.length > 38) {
    return false;
  }

  if (trimmedText !== trimmedText.toUpperCase()) {
    return false;
  }

  if (trimmedText.endsWith(":")) {
    return false;
  }

  if (isSceneHeadingPasteCandidate(trimmedText) || isTransitionPasteCandidate(trimmedText)) {
    return false;
  }

  if (previousBlockType === "document-start" || previousBlockType === "document-end") {
    return false;
  }

  return getScreenplayBlockDefinition(previousBlockType).allowedNext.includes("character");
}

export function classifyPlainTextParagraphForScreenplay(
  text: string,
  previousBlockType: ScreenplayBlockBoundary,
): ScreenplayBlockType {
  if (isSceneHeadingPasteCandidate(text)) {
    return "scene-heading";
  }

  if (isTransitionPasteCandidate(text)) {
    return "transition";
  }

  if (isParentheticalPasteCandidate(text, previousBlockType)) {
    return "parenthetical";
  }

  if (isCharacterPasteCandidate(text, previousBlockType)) {
    return "character";
  }

  if (
    previousBlockType === "character" ||
    previousBlockType === "parenthetical" ||
    previousBlockType === "dialogue"
  ) {
    return "dialogue";
  }

  return "action";
}

export function getScreenplayWritingRuleValidationErrors(): string[] {
  const errors: string[] = [];

  for (const [type, rule] of Object.entries(screenplayBoundaryInsertionRules) as [
    ScreenplayBlockType,
    ScreenplayBoundaryInsertionRule,
  ][]) {
    const definition = getScreenplayBlockDefinition(type);

    if (!definition.allowedNext.includes(rule.enterCreates)) {
      errors.push(`Enter insertion from "${type}" to "${rule.enterCreates}" violates allowedNext.`);
    }

    if (!definition.allowedNext.includes(rule.tabCreates)) {
      errors.push(`Tab insertion from "${type}" to "${rule.tabCreates}" violates allowedNext.`);
    }
  }

  return errors;
}
