import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, rgb } from "pdf-lib";

import { screenplayPageFormat } from "@/features/screenplay/format-rules";
import {
  type ScreenplayExportBlock,
  layoutScreenplayForExport,
  type ScreenplayLayoutPage,
} from "@/features/screenplay/screenplay-layout";

const MM_TO_PT = 72 / 25.4;

function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

/** A4 dimensions — keep aligned with `globals.css` / `screenplayPageFormat`. */
const PAGE_W_PT = mmToPt(210);
const PAGE_H_PT = mmToPt(297);
const M_TOP_PT = mmToPt(25);
const M_BOT_PT = mmToPt(25);
const M_BIND_PT = mmToPt(38);
const M_OUT_PT = mmToPt(22);

const BODY_W_PT = PAGE_W_PT - M_BIND_PT - M_OUT_PT;
const BODY_H_PT = PAGE_H_PT - M_TOP_PT - M_BOT_PT;

const FONT_SIZE = 12;
const BODY_LINES = screenplayPageFormat.bodyHeightLines;

function footerPageLabel(pageIndex: number): string | null {
  const { printedPageNumbersStartAt, printsPageNumberOnFirstPage } = screenplayPageFormat;
  if (!printsPageNumberOnFirstPage && pageIndex === 0) {
    return null;
  }
  const n =
    pageIndex - (printsPageNumberOnFirstPage ? 0 : 1) + printedPageNumbersStartAt;
  return `${n}.`;
}

function drawFooter(page: PDFPage, font: PDFFont, pageIndex: number) {
  const label = footerPageLabel(pageIndex);
  if (!label) {
    return;
  }
  const w = font.widthOfTextAtSize(label, FONT_SIZE);
  const y = M_BOT_PT - FONT_SIZE * 0.35;
  page.drawText(label, {
    x: PAGE_W_PT - M_OUT_PT - w,
    y,
    size: FONT_SIZE,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawLine(
  page: PDFPage,
  font: PDFFont,
  lineIndex: number,
  text: string,
  leftColumns: number,
  widthColumns: number,
  align: "left" | "right" | "center",
) {
  const lineHeight = BODY_H_PT / BODY_LINES;
  const yBodyTop = PAGE_H_PT - M_TOP_PT;
  const y = yBodyTop - (lineIndex + 1) * lineHeight + lineHeight * 0.2;

  const charUnit = BODY_W_PT / screenplayPageFormat.bodyWidthCharacters;
  const laneLeft = M_BIND_PT + leftColumns * charUnit;
  const laneWidth = widthColumns * charUnit;

  let x: number;
  const textW = font.widthOfTextAtSize(text, FONT_SIZE);

  if (align === "right") {
    const rightEdge = M_BIND_PT + BODY_W_PT;
    x = rightEdge - textW;
  } else if (align === "center") {
    x = laneLeft + (laneWidth - textW) / 2;
  } else {
    x = laneLeft;
  }

  if (text.length === 0) {
    return;
  }

  page.drawText(text, {
    x,
    y,
    size: FONT_SIZE,
    font,
    color: rgb(0, 0, 0),
  });
}

function drawPage(page: PDFPage, font: PDFFont, layout: ScreenplayLayoutPage, pageIndex: number) {
  for (let i = 0; i < layout.lines.length; i++) {
    const row = layout.lines[i]!;
    drawLine(page, font, i, row.text, row.leftColumns, row.widthColumns, row.align);
  }
  drawFooter(page, font, pageIndex);
}

export async function buildScreenplayPdfFromLayout(
  pages: readonly ScreenplayLayoutPage[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);

  if (pages.length === 0 || (pages.length === 1 && pages[0]!.lines.length === 0)) {
    const p = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
    drawFooter(p, font, 0);
  } else {
    for (let i = 0; i < pages.length; i++) {
      const p = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
      drawPage(p, font, pages[i]!, i);
    }
  }

  return doc.save();
}

export async function buildScreenplayPdfFromBlocks(
  blocks: readonly ScreenplayExportBlock[],
): Promise<Uint8Array> {
  const pages = layoutScreenplayForExport(blocks);
  return buildScreenplayPdfFromLayout(pages);
}
