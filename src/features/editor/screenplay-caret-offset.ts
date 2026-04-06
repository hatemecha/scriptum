import { $isLineBreakNode, $isTextNode, type LexicalNode } from "lexical";

import { $isScreenplayBlockNode, type ScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";

/**
 * Maps a collapsed range anchor to an index in `block.getTextContent()` (newlines count as one).
 * Ignores non–text inline nodes other than line breaks.
 */
export function getCaretOffsetInScreenplayBlock(
  block: ScreenplayBlockNode,
  anchorNode: LexicalNode,
  anchorOffset: number,
): number | null {
  if ($isScreenplayBlockNode(anchorNode) && anchorNode.is(block)) {
    return block.getTextContent().length === 0 ? 0 : null;
  }

  if ($isLineBreakNode(anchorNode)) {
    let offset = 0;
    for (const child of block.getChildren()) {
      if (child.is(anchorNode)) {
        return offset;
      }
      if ($isTextNode(child)) {
        offset += child.getTextContentSize();
      } else if ($isLineBreakNode(child)) {
        offset += 1;
      }
    }
    return null;
  }

  if ($isTextNode(anchorNode)) {
    let offset = 0;
    for (const child of block.getChildren()) {
      if ($isTextNode(child)) {
        if (child.is(anchorNode)) {
          return offset + anchorOffset;
        }
        offset += child.getTextContentSize();
      } else if ($isLineBreakNode(child)) {
        offset += 1;
      }
    }
  }

  return null;
}

export function isCollapsedCaretAtEndOfScreenplayBlock(
  block: ScreenplayBlockNode,
  anchorNode: LexicalNode,
  anchorOffset: number,
): boolean {
  const off = getCaretOffsetInScreenplayBlock(block, anchorNode, anchorOffset);
  if (off === null) {
    return false;
  }
  return off === block.getTextContent().length;
}
