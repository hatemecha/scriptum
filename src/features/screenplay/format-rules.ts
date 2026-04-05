import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

export const screenplayCssPixelsPerInch = 96;
export const screenplayCharactersPerInch = 10;
export const screenplayLinesPerInch = 6;

export const screenplayCharacterExtensions = ["(CONT'D)", "(O.S.)", "(V.O.)", "(O.C.)"] as const;

export interface ScreenplayPageFormat {
  pageWidthInches: number;
  pageHeightInches: number;
  topMarginInches: number;
  bottomMarginInches: number;
  leftMarginInches: number;
  rightMarginInches: number;
  bodyWidthInches: number;
  bodyHeightInches: number;
  bodyWidthCharacters: number;
  bodyHeightLines: number;
  printedPageNumbersStartAt: number;
  printsPageNumberOnFirstPage: boolean;
  printedPageNumberPattern: "number-with-trailing-period";
}

export interface ScreenplayBlockFormatRule {
  type: ScreenplayBlockType;
  label: string;
  textTransform: "uppercase" | "preserve" | "parenthetical";
  alignment: "left" | "right";
  absoluteLeftInches: number;
  widthInches: number;
  leftColumns: number;
  widthColumns: number;
  spaceBeforeLines: 0 | 1;
  pageBreakPolicy:
    | "keep-with-next-render-unit"
    | "keep-with-character-dialogue-unit"
    | "keep-with-following-dialogue-line"
    | "split-by-rendered-line"
    | "keep-with-previous-render-unit";
  insertsAutomaticContinuationMarker: boolean;
  notes: readonly string[];
}

export interface ScreenplayCharacterDisplayOptions {
  interruptedSameSpeakerContinuation?: boolean;
  pageBreakContinuation?: boolean;
}

export interface ScreenplayBlockDisplayOptions {
  character?: ScreenplayCharacterDisplayOptions;
}

export interface ScreenplayFormatReferenceSample {
  label: string;
  type: ScreenplayBlockType;
  sourceText: string;
  options?: ScreenplayBlockDisplayOptions;
  expectedDisplayText: string;
}

export const screenplayPageFormat = {
  pageWidthInches: 8.5,
  pageHeightInches: 11,
  topMarginInches: 1,
  bottomMarginInches: 1,
  leftMarginInches: 1.5,
  rightMarginInches: 1,
  bodyWidthInches: 6,
  bodyHeightInches: 9,
  bodyWidthCharacters: 60,
  bodyHeightLines: 54,
  printedPageNumbersStartAt: 2,
  printsPageNumberOnFirstPage: false,
  printedPageNumberPattern: "number-with-trailing-period",
} as const satisfies ScreenplayPageFormat;

export const screenplayBlockFormatRules = {
  "scene-heading": {
    type: "scene-heading",
    label: "Scene Heading",
    textTransform: "uppercase",
    alignment: "left",
    absoluteLeftInches: 1.5,
    widthInches: 6,
    leftColumns: 0,
    widthColumns: 60,
    spaceBeforeLines: 1,
    pageBreakPolicy: "keep-with-next-render-unit",
    insertsAutomaticContinuationMarker: false,
    notes: [
      "Uses the full body width and anchors to the left page margin.",
      "Must stay on the same page as the first renderable unit that follows it.",
    ],
  },
  action: {
    type: "action",
    label: "Action",
    textTransform: "preserve",
    alignment: "left",
    absoluteLeftInches: 1.5,
    widthInches: 6,
    leftColumns: 0,
    widthColumns: 60,
    spaceBeforeLines: 1,
    pageBreakPolicy: "split-by-rendered-line",
    insertsAutomaticContinuationMarker: false,
    notes: [
      "Uses the full body width and preserves mixed case.",
      "May split only at rendered line boundaries, never mid-line.",
    ],
  },
  character: {
    type: "character",
    label: "Character",
    textTransform: "uppercase",
    alignment: "left",
    absoluteLeftInches: 3.7,
    widthInches: 3.8,
    leftColumns: 22,
    widthColumns: 38,
    spaceBeforeLines: 1,
    pageBreakPolicy: "keep-with-character-dialogue-unit",
    insertsAutomaticContinuationMarker: true,
    notes: [
      "Character cues are displayed in uppercase and use a dedicated cue lane.",
      "A cue must stay with at least one following dialogue line or a parenthetical-plus-dialogue pair.",
    ],
  },
  dialogue: {
    type: "dialogue",
    label: "Dialogue",
    textTransform: "preserve",
    alignment: "left",
    absoluteLeftInches: 2.5,
    widthInches: 3.5,
    leftColumns: 10,
    widthColumns: 35,
    spaceBeforeLines: 0,
    pageBreakPolicy: "split-by-rendered-line",
    insertsAutomaticContinuationMarker: true,
    notes: [
      "Dialogue preserves mixed case and sits inside the standard 35-character lane.",
      "When dialogue breaks across pages it gains (MORE) at the bottom and a repeated character cue with (CONT'D) at the top.",
    ],
  },
  parenthetical: {
    type: "parenthetical",
    label: "Parenthetical",
    textTransform: "parenthetical",
    alignment: "left",
    absoluteLeftInches: 3,
    widthInches: 2.5,
    leftColumns: 15,
    widthColumns: 25,
    spaceBeforeLines: 0,
    pageBreakPolicy: "keep-with-following-dialogue-line",
    insertsAutomaticContinuationMarker: false,
    notes: [
      "Parentheticals are always rendered inside parentheses.",
      "A parenthetical cannot be the last rendered line on a page without at least one following dialogue line.",
    ],
  },
  transition: {
    type: "transition",
    label: "Transition",
    textTransform: "uppercase",
    alignment: "right",
    absoluteLeftInches: 1.5,
    widthInches: 6,
    leftColumns: 0,
    widthColumns: 60,
    spaceBeforeLines: 1,
    pageBreakPolicy: "keep-with-previous-render-unit",
    insertsAutomaticContinuationMarker: false,
    notes: [
      "Transitions are right-aligned against the body frame, not manually padded with spaces.",
      "A transition cannot become the first rendered line of a page.",
    ],
  },
} as const satisfies Record<ScreenplayBlockType, ScreenplayBlockFormatRule>;

export const screenplayAutomaticCasingRules = {
  normalizedDuring: [
    "block-commit",
    "manual-conversion",
    "paste-normalization",
    "save",
    "export",
  ] as const,
  uppercaseBlockTypes: [
    "scene-heading",
    "character",
    "transition",
  ] as const satisfies readonly ScreenplayBlockType[],
  preservesTypedCaseBlockTypes: [
    "action",
    "dialogue",
  ] as const satisfies readonly ScreenplayBlockType[],
  parentheticalAutoWrapsParentheses: true,
  displayOnlyTokens: ["(MORE)", "(CONT'D)"] as const,
  automaticCharacterContinuationIsStoredInBaseText: false,
} as const;

export const screenplayPaginationRules = {
  splitOnlyAtRenderedLineBoundaries: true,
  protectsSentencesAtBottomOfPage: true,
  sentenceBoundaryCharacters: [".", "?", "!", "..."] as const,
  firstBlockOnPageSuppressesSpaceBefore: true,
  dialogueBreakMarker: "(MORE)",
  repeatedCharacterSuffixOnDialogueBreak: "(CONT'D)",
  repeatCharacterCueOnDialogueBreak: true,
  automaticCharacterContinuationWithinScene: true,
  automaticCharacterContinuationAcrossSceneHeading: false,
  automaticCharacterContinuationAcrossTransition: false,
  sceneContinuationMarkersEnabled: false,
} as const;

export const screenplayVisualContinuityRules = {
  useIdenticalPageGeometryInEditorAndPdf: true,
  allowUserControlledTabsOrSpacesForAlignment: false,
  deriveAlignmentStrictlyFromBlockType: true,
  deriveContinuationMarkersDuringRender: true,
  allowPerBlockCustomLeading: false,
  allowPerBlockCustomIndentation: false,
} as const;

export const screenplayFormatReferenceSamples = [
  {
    label: "Scene heading normalization",
    type: "scene-heading",
    sourceText: "int. kitchen - night",
    expectedDisplayText: "INT. KITCHEN - NIGHT",
  },
  {
    label: "Action whitespace collapse",
    type: "action",
    sourceText: "The kettle   screams    on the stove.",
    expectedDisplayText: "The kettle screams on the stove.",
  },
  {
    label: "Character normalization",
    type: "character",
    sourceText: "maria",
    expectedDisplayText: "MARIA",
  },
  {
    label: "Character continuation after interruption",
    type: "character",
    sourceText: "maria",
    options: {
      character: {
        interruptedSameSpeakerContinuation: true,
      },
    },
    expectedDisplayText: "MARIA (CONT'D)",
  },
  {
    label: "Character continuation on page break",
    type: "character",
    sourceText: "maria",
    options: {
      character: {
        pageBreakContinuation: true,
      },
    },
    expectedDisplayText: "MARIA (CONT'D)",
  },
  {
    label: "Dialogue preservation",
    type: "dialogue",
    sourceText: "I thought we were late.",
    expectedDisplayText: "I thought we were late.",
  },
  {
    label: "Parenthetical wrapping",
    type: "parenthetical",
    sourceText: "half awake",
    expectedDisplayText: "(half awake)",
  },
  {
    label: "Transition normalization",
    type: "transition",
    sourceText: "cut to:",
    expectedDisplayText: "CUT TO:",
  },
] as const satisfies readonly ScreenplayFormatReferenceSample[];

const automaticCharacterContinuationPattern = /\s+\(CONT'D\)$/i;

function normalizeSingleParagraphWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripAutomaticCharacterContinuation(text: string): string {
  return text.replace(/[’]/g, "'").replace(automaticCharacterContinuationPattern, "").trim();
}

function shouldAppendCharacterContinuation(
  options: ScreenplayCharacterDisplayOptions | undefined,
): boolean {
  return Boolean(options?.interruptedSameSpeakerContinuation || options?.pageBreakContinuation);
}

function normalizeCharacterBaseText(text: string): string {
  const normalizedText = normalizeSingleParagraphWhitespace(
    stripAutomaticCharacterContinuation(text),
  );

  return normalizedText.toUpperCase();
}

export function inchesToCssPixels(valueInches: number): number {
  return valueInches * screenplayCssPixelsPerInch;
}

export function getScreenplayBlockFormatRule(type: ScreenplayBlockType): ScreenplayBlockFormatRule {
  return screenplayBlockFormatRules[type];
}

export function getScreenplayBlockCssMetrics(type: ScreenplayBlockType): {
  leftPx: number;
  widthPx: number;
} {
  const rule = getScreenplayBlockFormatRule(type);

  return {
    leftPx: inchesToCssPixels(rule.absoluteLeftInches),
    widthPx: inchesToCssPixels(rule.widthInches),
  };
}

export function normalizeSceneHeadingText(text: string): string {
  return normalizeSingleParagraphWhitespace(text)
    .replace(/\s+[–—-]\s+/g, " - ")
    .toUpperCase();
}

export function normalizeActionText(text: string): string {
  return normalizeSingleParagraphWhitespace(text);
}

export function normalizeCharacterText(
  text: string,
  options?: ScreenplayCharacterDisplayOptions,
): string {
  const normalizedBaseText = normalizeCharacterBaseText(text);

  if (normalizedBaseText.length === 0) {
    return normalizedBaseText;
  }

  if (!shouldAppendCharacterContinuation(options)) {
    return normalizedBaseText;
  }

  return `${normalizedBaseText} (CONT'D)`;
}

export function normalizeDialogueText(text: string): string {
  return normalizeSingleParagraphWhitespace(text);
}

export function normalizeParentheticalText(text: string): string {
  const normalizedText = normalizeSingleParagraphWhitespace(text);

  if (normalizedText.length === 0) {
    return normalizedText;
  }

  const innerText =
    normalizedText.startsWith("(") && normalizedText.endsWith(")")
      ? normalizedText.slice(1, -1).trim()
      : normalizedText;

  if (innerText.length === 0) {
    return "";
  }

  return `(${innerText})`;
}

export function normalizeTransitionText(text: string): string {
  return normalizeSingleParagraphWhitespace(text).toUpperCase();
}

export function formatScreenplayBlockText(
  type: ScreenplayBlockType,
  text: string,
  options?: ScreenplayBlockDisplayOptions,
): string {
  switch (type) {
    case "scene-heading":
      return normalizeSceneHeadingText(text);
    case "action":
      return normalizeActionText(text);
    case "character":
      return normalizeCharacterText(text, options?.character);
    case "dialogue":
      return normalizeDialogueText(text);
    case "parenthetical":
      return normalizeParentheticalText(text);
    case "transition":
      return normalizeTransitionText(text);
  }
}

export function getScreenplayFormatValidationErrors(): string[] {
  const errors: string[] = [];
  const pageBodyRightEdge =
    screenplayPageFormat.pageWidthInches - screenplayPageFormat.rightMarginInches;

  for (const rule of Object.values(screenplayBlockFormatRules)) {
    const calculatedRightEdge = rule.absoluteLeftInches + rule.widthInches;

    if (calculatedRightEdge > pageBodyRightEdge + Number.EPSILON) {
      errors.push(
        `${rule.type} exceeds the screenplay body frame (${calculatedRightEdge}" > ${pageBodyRightEdge}").`,
      );
    }

    const expectedWidthColumns = Math.round(rule.widthInches * screenplayCharactersPerInch);

    if (expectedWidthColumns !== rule.widthColumns) {
      errors.push(
        `${rule.type} widthColumns (${rule.widthColumns}) do not match widthInches (${rule.widthInches}).`,
      );
    }

    const expectedLeftColumns = Math.round(
      (rule.absoluteLeftInches - screenplayPageFormat.leftMarginInches) *
        screenplayCharactersPerInch,
    );

    if (expectedLeftColumns !== rule.leftColumns) {
      errors.push(
        `${rule.type} leftColumns (${rule.leftColumns}) do not match absoluteLeftInches (${rule.absoluteLeftInches}).`,
      );
    }
  }

  const calculatedBodyWidthCharacters = Math.round(
    screenplayPageFormat.bodyWidthInches * screenplayCharactersPerInch,
  );

  if (calculatedBodyWidthCharacters !== screenplayPageFormat.bodyWidthCharacters) {
    errors.push(
      `Body width characters (${screenplayPageFormat.bodyWidthCharacters}) do not match page body width (${screenplayPageFormat.bodyWidthInches}).`,
    );
  }

  const calculatedBodyHeightLines = Math.round(
    screenplayPageFormat.bodyHeightInches * screenplayLinesPerInch,
  );

  if (calculatedBodyHeightLines !== screenplayPageFormat.bodyHeightLines) {
    errors.push(
      `Body height lines (${screenplayPageFormat.bodyHeightLines}) do not match page body height (${screenplayPageFormat.bodyHeightInches}).`,
    );
  }

  for (const sample of screenplayFormatReferenceSamples) {
    const formattedText = formatScreenplayBlockText(
      sample.type,
      sample.sourceText,
      "options" in sample ? sample.options : undefined,
    );

    if (formattedText !== sample.expectedDisplayText) {
      errors.push(
        `Format sample "${sample.label}" resolved to "${formattedText}" instead of "${sample.expectedDisplayText}".`,
      );
    }
  }

  return errors;
}
