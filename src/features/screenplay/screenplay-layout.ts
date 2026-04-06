import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import {
  formatScreenplayBlockText,
  getScreenplayBlockFormatRule,
  screenplayPageFormat,
  screenplayPaginationRules,
} from "@/features/screenplay/format-rules";

export type ScreenplayExportBlock = {
  type: ScreenplayBlockType;
  text: string;
};

export type ScreenplayLayoutLine = {
  blockType: ScreenplayBlockType;
  text: string;
  leftColumns: number;
  widthColumns: number;
  align: "left" | "right" | "center";
};

export type ScreenplayLayoutPage = {
  lines: ScreenplayLayoutLine[];
};

const MAX_LINES = screenplayPageFormat.bodyHeightLines;
const MARK_MORE = screenplayPaginationRules.dialogueBreakMarker;
const FULL_COLS = screenplayPageFormat.bodyWidthCharacters;

export function wrapScreenplayPlainText(text: string, maxCols: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) {
    return [];
  }
  const words = normalized.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur.length > 0 ? `${cur} ${w}` : w;
    if (next.length <= maxCols) {
      cur = next;
      continue;
    }
    if (cur.length > 0) {
      lines.push(cur);
      cur = "";
    }
    if (w.length <= maxCols) {
      cur = w;
    } else {
      let rest = w;
      while (rest.length > maxCols) {
        lines.push(rest.slice(0, maxCols));
        rest = rest.slice(maxCols);
      }
      cur = rest;
    }
  }
  if (cur.length > 0) {
    lines.push(cur);
  }
  return lines;
}

function ruleFor(type: ScreenplayBlockType) {
  return getScreenplayBlockFormatRule(type);
}

function linesForBlock(block: ScreenplayExportBlock): string[] {
  const r = ruleFor(block.type);
  const body = formatScreenplayBlockText(block.type, block.text);
  return wrapScreenplayPlainText(body, r.widthColumns);
}

export type FlatSegment =
  | {
      kind: "block";
      block: ScreenplayExportBlock;
      lines: string[];
      spaceBeforeLines: 0 | 1;
      pageBreakPolicy: ReturnType<typeof ruleFor>["pageBreakPolicy"];
    }
  | {
      kind: "dialogue-unit";
      characterBlock: ScreenplayExportBlock;
      characterLines: string[];
      following: readonly {
        block: ScreenplayExportBlock;
        lines: string[];
      }[];
      spaceBeforeLines: 0 | 1;
    };

function flattenBlocksToSegments(blocks: readonly ScreenplayExportBlock[]): FlatSegment[] {
  const out: FlatSegment[] = [];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i];
    if (!b) break;

    if (b.type === "character") {
      const following: { block: ScreenplayExportBlock; lines: string[] }[] = [];
      let j = i + 1;
      while (j < blocks.length) {
        const nb = blocks[j];
        if (!nb || (nb.type !== "parenthetical" && nb.type !== "dialogue")) {
          break;
        }
        following.push({ block: nb, lines: linesForBlock(nb) });
        j += 1;
      }
      out.push({
        kind: "dialogue-unit",
        characterBlock: b,
        characterLines: linesForBlock(b),
        following,
        spaceBeforeLines: ruleFor("character").spaceBeforeLines,
      });
      i = j;
      continue;
    }

    const lines = linesForBlock(b);
    out.push({
      kind: "block",
      block: b,
      lines,
      spaceBeforeLines: ruleFor(b.type).spaceBeforeLines,
      pageBreakPolicy: ruleFor(b.type).pageBreakPolicy,
    });
    i += 1;
  }

  return out;
}

/** Lines still required after `applySpaceBefore` for the heading (spacing is already counted). */
function headingBudgetWithFollower(headingLines: string[], followerNeedLines: number): number {
  return headingLines.length + Math.max(1, followerNeedLines);
}

function followerNeedLines(next: FlatSegment | undefined): number {
  if (!next) return 1;
  if (next.kind === "block") {
    return Math.max(1, next.lines.length > 0 ? 1 : 1);
  }
  const c = Math.max(1, next.characterLines.length);
  const hasDial = next.following.some((f) => f.block.type === "dialogue" && f.lines.length > 0);
  const hasPar = next.following.some((f) => f.block.type === "parenthetical" && f.lines.length > 0);
  if (hasDial) return c + 1 + (hasPar ? 1 : 0);
  if (hasPar) return c + 2;
  return c;
}

class Paginator {
  pages: ScreenplayLayoutPage[] = [{ lines: [] }];
  maxLines = MAX_LINES;

  curPage(): ScreenplayLayoutPage {
    return this.pages[this.pages.length - 1]!;
  }

  lineCount(): number {
    return this.curPage().lines.length;
  }

  isFirstOnPage(): boolean {
    return this.lineCount() === 0;
  }

  newPage() {
    this.pages.push({ lines: [] });
  }

  roomLeft(reserveBottom = 0): number {
    return Math.max(0, this.maxLines - this.lineCount() - reserveBottom);
  }

  push(line: ScreenplayLayoutLine) {
    if (this.lineCount() >= this.maxLines) {
      this.newPage();
    }
    this.curPage().lines.push(line);
  }

  addBlankLine() {
    this.push({
      blockType: "action",
      text: "",
      leftColumns: 0,
      widthColumns: FULL_COLS,
      align: "left",
    });
  }

  applySpaceBefore(spaceBeforeLines: 0 | 1) {
    if (spaceBeforeLines === 0) return;
    if (this.isFirstOnPage() && screenplayPaginationRules.firstBlockOnPageSuppressesSpaceBefore) {
      return;
    }
    this.addBlankLine();
  }

  emitLines(
    type: ScreenplayBlockType,
    rawLines: string[],
    alignOverride?: "left" | "right" | "center",
  ) {
    const r = ruleFor(type);
    const align = alignOverride ?? (r.alignment === "right" ? "right" : "left");
    for (const t of rawLines) {
      this.push({
        blockType: type,
        text: t,
        leftColumns: r.leftColumns,
        widthColumns: r.widthColumns,
        align,
      });
    }
  }

  emitMoreMarker() {
    const r = ruleFor("dialogue");
    this.push({
      blockType: "dialogue",
      text: MARK_MORE,
      leftColumns: r.leftColumns,
      widthColumns: r.widthColumns,
      align: "center",
    });
  }

  emitCharacterCue(block: ScreenplayExportBlock, continuation: boolean) {
    const text = continuation
      ? formatScreenplayBlockText("character", block.text, { character: { pageBreakContinuation: true } })
      : formatScreenplayBlockText("character", block.text);
    const r = ruleFor("character");
    this.push({
      blockType: "character",
      text,
      leftColumns: r.leftColumns,
      widthColumns: r.widthColumns,
      align: "left",
    });
  }
}

function emitSceneHeading(
  paginator: Paginator,
  lines: string[],
  needWithFollower: number,
  spaceBeforeLines: 0 | 1,
) {
  paginator.applySpaceBefore(spaceBeforeLines);
  if (paginator.lineCount() + needWithFollower > paginator.maxLines && !paginator.isFirstOnPage()) {
    paginator.newPage();
  }
  if (
    paginator.lineCount() + needWithFollower > paginator.maxLines &&
    paginator.isFirstOnPage() &&
    paginator.pages.length > 1
  ) {
    paginator.newPage();
  }
  for (const ln of lines) {
    if (paginator.lineCount() >= paginator.maxLines) {
      paginator.newPage();
    }
    paginator.emitLines("scene-heading", [ln]);
  }
}

function emitPlainBlock(paginator: Paginator, segment: Extract<FlatSegment, { kind: "block" }>) {
  const { block, lines, spaceBeforeLines, pageBreakPolicy } = segment;

  if (
    block.type === "transition" &&
    paginator.isFirstOnPage() &&
    paginator.pages.length > 1
  ) {
    paginator.applySpaceBefore(spaceBeforeLines);
    const prev = paginator.pages[paginator.pages.length - 2]!;
    if (prev.lines.length + lines.length <= paginator.maxLines) {
      paginator.pages.pop();
      const r = ruleFor("transition");
      for (const ln of lines) {
        prev.lines.push({
          blockType: "transition",
          text: ln,
          leftColumns: r.leftColumns,
          widthColumns: r.widthColumns,
          align: "right",
        });
      }
      return;
    }
  }

  paginator.applySpaceBefore(spaceBeforeLines);

  if (pageBreakPolicy === "split-by-rendered-line") {
    for (const ln of lines) {
      if (paginator.lineCount() >= paginator.maxLines) {
        paginator.newPage();
      }
      paginator.emitLines(block.type, [ln]);
    }
    return;
  }

  if (paginator.lineCount() + lines.length > paginator.maxLines && !paginator.isFirstOnPage()) {
    paginator.newPage();
  }
  paginator.emitLines(block.type, lines);
}

function minLinesForDialogueUnit(seg: Extract<FlatSegment, { kind: "dialogue-unit" }>): number {
  const charN = Math.max(1, seg.characterLines.length > 0 ? seg.characterLines.length : 1);
  const hasDial = seg.following.some((f) => f.block.type === "dialogue" && f.lines.length > 0);
  const hasPar = seg.following.some((f) => f.block.type === "parenthetical" && f.lines.length > 0);
  if (hasDial) {
    return charN + (hasPar ? 2 : 1);
  }
  if (hasPar) {
    return charN + 2;
  }
  return charN;
}

function emitDialogueUnit(paginator: Paginator, seg: Extract<FlatSegment, { kind: "dialogue-unit" }>) {
  paginator.applySpaceBefore(seg.spaceBeforeLines);

  const minKeep = minLinesForDialogueUnit(seg);
  if (paginator.lineCount() + minKeep > paginator.maxLines && !paginator.isFirstOnPage()) {
    paginator.newPage();
  }

  const emitCharacterInitial = () => {
    if (seg.characterLines.length === 0) {
      return;
    }
    for (let i = 0; i < seg.characterLines.length; i++) {
      if (paginator.lineCount() >= paginator.maxLines) {
        paginator.newPage();
      }
      const r = ruleFor("character");
      paginator.push({
        blockType: "character",
        text: seg.characterLines[i]!,
        leftColumns: r.leftColumns,
        widthColumns: r.widthColumns,
        align: "left",
      });
    }
  };

  emitCharacterInitial();

  for (const part of seg.following) {
    const { block, lines } = part;

    for (let li = 0; li < lines.length; li++) {
      const isLastLine = li === lines.length - 1;
      const reserveMore = block.type === "dialogue" && !isLastLine ? 1 : 0;

      if (block.type === "dialogue" && paginator.roomLeft(reserveMore) < 1) {
        if (!paginator.isFirstOnPage()) {
          paginator.emitMoreMarker();
        }
        paginator.newPage();
        paginator.emitCharacterCue(seg.characterBlock, true);
      } else if (paginator.lineCount() >= paginator.maxLines) {
        paginator.newPage();
        if (block.type === "dialogue" || block.type === "parenthetical") {
          paginator.emitCharacterCue(seg.characterBlock, true);
        }
      }

      paginator.emitLines(block.type, [lines[li]!]);
    }
  }
}

/**
 * Paginates formatted screenplay blocks into pages of `bodyHeightLines` rows.
 * Uses the same column grid and typing rules as [`format-rules`](./format-rules.ts).
 */
export function layoutScreenplayForExport(blocks: readonly ScreenplayExportBlock[]): ScreenplayLayoutPage[] {
  if (blocks.length === 0) {
    return [{ lines: [] }];
  }

  const segments = flattenBlocksToSegments(blocks);
  const paginator = new Paginator();

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s]!;

    if (seg.kind === "dialogue-unit") {
      emitDialogueUnit(paginator, seg);
      continue;
    }

    if (seg.block.type === "scene-heading") {
      const next = segments[s + 1];
      const need = headingBudgetWithFollower(seg.lines, followerNeedLines(next));
      emitSceneHeading(paginator, seg.lines, need, seg.spaceBeforeLines);
      continue;
    }

    emitPlainBlock(paginator, seg);
  }

  if (paginator.pages.length === 1 && paginator.curPage().lines.length === 0) {
    return [{ lines: [] }];
  }

  return paginator.pages;
}
