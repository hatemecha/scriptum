import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

/**
 * When the user presses Enter, which block type should the new empty block be?
 * Follows standard screenplay writing conventions.
 */
const ENTER_NEXT_BLOCK: Record<ScreenplayBlockType, ScreenplayBlockType> = {
  "scene-heading": "action",
  action: "action",
  character: "dialogue",
  /** Más parlamento del mismo personaje o línea tras un paréntesis; doble Enter vacío pasa a acción. */
  dialogue: "dialogue",
  parenthetical: "dialogue",
  transition: "scene-heading",
};

/**
 * Tab cycles forward through block types.
 * The cycle is: Action -> Character -> Dialogue -> Parenthetical -> Transition -> Scene Heading -> Action
 */
const TAB_CYCLE: readonly ScreenplayBlockType[] = [
  "action",
  "character",
  "dialogue",
  "parenthetical",
  "transition",
  "scene-heading",
];

/**
 * When Enter is pressed on a non-empty block, what type should the new block be?
 */
export function getNextBlockTypeOnEnter(
  currentType: ScreenplayBlockType,
): ScreenplayBlockType {
  return ENTER_NEXT_BLOCK[currentType];
}

/**
 * When Enter is pressed on an empty block, convert it to action
 * (escape hatch to leave any block type).
 */
export function getBlockTypeOnEmptyEnter(
  currentType: ScreenplayBlockType,
): ScreenplayBlockType | null {
  if (currentType === "action") {
    return null;
  }
  return "action";
}

/**
 * Tab: cycle the current block type forward.
 */
export function getNextBlockTypeOnTab(
  currentType: ScreenplayBlockType,
): ScreenplayBlockType {
  const currentIndex = TAB_CYCLE.indexOf(currentType);
  if (currentIndex === -1) return "action";
  return TAB_CYCLE[(currentIndex + 1) % TAB_CYCLE.length];
}

/**
 * Shift+Tab: cycle the current block type backward.
 */
export function getPrevBlockTypeOnShiftTab(
  currentType: ScreenplayBlockType,
): ScreenplayBlockType {
  const currentIndex = TAB_CYCLE.indexOf(currentType);
  if (currentIndex === -1) return "action";
  return TAB_CYCLE[(currentIndex - 1 + TAB_CYCLE.length) % TAB_CYCLE.length];
}

/**
 * When backspace is pressed at the start of a block, what should happen?
 * Returns the type to convert to, or null to merge with previous.
 */
export function getBlockTypeOnBackspaceAtStart(
  currentType: ScreenplayBlockType,
): ScreenplayBlockType | null {
  if (currentType === "action") {
    return null;
  }
  return "action";
}

/**
 * Human-readable label for a block type.
 */
const BLOCK_LABELS: Record<ScreenplayBlockType, string> = {
  "scene-heading": "Scene Heading",
  action: "Action",
  character: "Character",
  dialogue: "Dialogue",
  parenthetical: "Parenthetical",
  transition: "Transition",
};

export function getBlockTypeLabel(type: ScreenplayBlockType): string {
  return BLOCK_LABELS[type];
}
