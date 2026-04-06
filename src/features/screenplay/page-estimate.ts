import { getScreenplayBlockFormatRule, screenplayPageFormat } from "@/features/screenplay/format-rules";

import { type ScreenplayBlockType } from "./blocks";

export type PageEstimateBlock = {
  text: string;
  type: ScreenplayBlockType;
};

function estimateWrappedLines(text: string, columns: number): number {
  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (normalizedText.length === 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(normalizedText.length / columns));
}

export function estimateScreenplayPageCount(blocks: readonly PageEstimateBlock[]): number {
  if (blocks.length === 0) {
    return 1;
  }

  const totalRenderedLines = blocks.reduce((lineCount, block, index) => {
    const blockRule = getScreenplayBlockFormatRule(block.type);
    const wrappedLines = estimateWrappedLines(block.text, blockRule.widthColumns);
    const leadingLines = index === 0 ? 0 : blockRule.spaceBeforeLines;

    return lineCount + wrappedLines + leadingLines;
  }, 0);

  return Math.max(1, Math.ceil(totalRenderedLines / screenplayPageFormat.bodyHeightLines));
}
