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

/** Metadata for the optional PDF cover page (before the screenplay body). */
export type ScreenplayPdfTitlePageInput = {
  address: string | null;
  author: string | null;
  companyName: string | null;
  companyRegistration: string | null;
  contactEmail: string | null;
  revisedBy: string | null;
  revisionLabel: string | null;
  title: string;
};

export type BuildScreenplayPdfOptions = {
  /** When set, inserted as page 1; body pages follow and keep the same footer numbering as before. */
  titlePage: ScreenplayPdfTitlePageInput | null;
};

function footerPageLabel(scriptPageIndex: number): string | null {
  const { printedPageNumbersStartAt, printsPageNumberOnFirstPage } = screenplayPageFormat;
  if (!printsPageNumberOnFirstPage && scriptPageIndex === 0) {
    return null;
  }
  const n =
    scriptPageIndex - (printsPageNumberOnFirstPage ? 0 : 1) + printedPageNumbersStartAt;
  return `${n}.`;
}

function drawFooter(
  page: PDFPage,
  font: PDFFont,
  scriptPageIndex: number,
) {
  const label = footerPageLabel(scriptPageIndex);
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

function drawPage(
  page: PDFPage,
  font: PDFFont,
  layout: ScreenplayLayoutPage,
  scriptPageIndex: number,
) {
  for (let i = 0; i < layout.lines.length; i++) {
    const row = layout.lines[i]!;
    drawLine(page, font, i, row.text, row.leftColumns, row.widthColumns, row.align);
  }
  drawFooter(page, font, scriptPageIndex);
}

function wrapPlainTextToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) {
    return [];
  }
  const words = normalized.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur.length > 0 ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      cur = next;
      continue;
    }
    if (cur.length > 0) {
      lines.push(cur);
      cur = "";
    }
    if (font.widthOfTextAtSize(w, size) <= maxWidth) {
      cur = w;
    } else {
      let rest = w;
      while (rest.length > 0) {
        let take = rest.length;
        while (take > 0 && font.widthOfTextAtSize(rest.slice(0, take), size) > maxWidth) {
          take -= 1;
        }
        if (take === 0) {
          take = 1;
        }
        lines.push(rest.slice(0, take));
        rest = rest.slice(take);
      }
    }
  }
  if (cur.length > 0) {
    lines.push(cur);
  }
  return lines;
}

type CreditSection = { label: string; value: string };

function buildCreditSections(meta: ScreenplayPdfTitlePageInput): CreditSection[] {
  const sections: CreditSection[] = [];
  if (meta.author != null && meta.author.trim().length > 0) {
    sections.push({ label: "Escrito por", value: meta.author.trim() });
  }
  if (meta.revisedBy != null && meta.revisedBy.trim().length > 0) {
    sections.push({ label: "Revisado por", value: meta.revisedBy.trim() });
  }
  if (meta.revisionLabel != null && meta.revisionLabel.trim().length > 0) {
    sections.push({ label: "Revisión", value: meta.revisionLabel.trim() });
  }
  return sections;
}

function hasCompanyBlock(meta: ScreenplayPdfTitlePageInput): boolean {
  return [meta.companyName, meta.address, meta.companyRegistration, meta.contactEmail].some(
    (v) => v != null && v.trim().length > 0,
  );
}

function buildCompanyLines(meta: ScreenplayPdfTitlePageInput): string[] {
  const stack: string[] = [];
  if (meta.companyName?.trim()) {
    stack.push(meta.companyName.trim());
  }
  if (meta.address?.trim()) {
    for (const part of meta.address.split(/\n+/)) {
      const t = part.trim();
      if (t.length > 0) {
        stack.push(t);
      }
    }
  }
  const reg = meta.companyRegistration?.trim();
  const em = meta.contactEmail?.trim();
  if (reg || em) {
    const parts: string[] = [];
    if (reg) {
      parts.push(reg);
    }
    if (em) {
      parts.push(em);
    }
    stack.push(parts.join("  |  "));
  }
  return stack;
}

const TITLE_PAGE_LABEL_RGB = rgb(0.38, 0.38, 0.38);
const TITLE_PAGE_BODY_RGB = rgb(0, 0, 0);

/**
 * Single vertically centered column: title, credit sections (label + value, spaced), optional contact block.
 * No decorative or separator lines — spacing and type size carry the hierarchy.
 */
function drawTitlePage(
  page: PDFPage,
  titleFont: PDFFont,
  bodyFont: PDFFont,
  meta: ScreenplayPdfTitlePageInput,
): void {
  const centerX = PAGE_W_PT / 2;
  const maxTextW = BODY_W_PT * 0.88;

  /** Courier Bold: misma familia que el cuerpo, un poco más grande — visible pero sobrio. */
  const titleSize = 14;
  const labelSize = 10;
  const valueSize = 12;
  const companySize = 10;
  const titleLineHeight = titleSize * 1.42;
  const labelLineHeight = labelSize * 1.25;
  const valueLineHeight = valueSize * 1.32;
  const companyLineHeight = companySize * 1.38;
  const gapAfterTitle = 36;
  const gapLabelToValue = 5;
  const gapAfterSection = 20;
  const gapCreditsToCompany = 32;

  const rawTitle = meta.title.trim().length > 0 ? meta.title.trim() : "Sin título";
  const displayTitle = `"${rawTitle}"`;
  const titleLines = wrapPlainTextToWidth(displayTitle, titleFont, titleSize, maxTextW);

  const creditSections = buildCreditSections(meta);
  const companyLines = hasCompanyBlock(meta) ? buildCompanyLines(meta) : [];

  type Segment = { height: number };
  const segments: Segment[] = [];

  for (const _ of titleLines) {
    segments.push({ height: titleLineHeight });
  }
  segments.push({ height: gapAfterTitle });

  for (let s = 0; s < creditSections.length; s++) {
    const sec = creditSections[s]!;
    segments.push({ height: labelLineHeight });
    segments.push({ height: gapLabelToValue });
    const valueWrapped = wrapPlainTextToWidth(sec.value, bodyFont, valueSize, maxTextW);
    for (const _ of valueWrapped) {
      segments.push({ height: valueLineHeight });
    }
    if (s < creditSections.length - 1) {
      segments.push({ height: gapAfterSection });
    }
  }

  if (companyLines.length > 0) {
    if (creditSections.length > 0) {
      segments.push({ height: gapCreditsToCompany });
    }
    for (let c = 0; c < companyLines.length; c++) {
      const wrapped = wrapPlainTextToWidth(companyLines[c]!, bodyFont, companySize, maxTextW);
      for (const _ of wrapped) {
        segments.push({ height: companyLineHeight });
      }
      if (c < companyLines.length - 1) {
        segments.push({ height: companyLineHeight * 0.25 });
      }
    }
  }

  const totalHeight = segments.reduce((acc, seg) => acc + seg.height, 0);

  const yContentLow = M_BOT_PT + 52;
  const yContentHigh = PAGE_H_PT - M_TOP_PT - 48;
  const verticalMid = (yContentLow + yContentHigh) / 2;

  let y = verticalMid + totalHeight / 2;

  for (const line of titleLines) {
    const w = titleFont.widthOfTextAtSize(line, titleSize);
    page.drawText(line, {
      x: centerX - w / 2,
      y,
      size: titleSize,
      font: titleFont,
      color: TITLE_PAGE_BODY_RGB,
    });
    y -= titleLineHeight;
  }

  y -= gapAfterTitle;

  for (let s = 0; s < creditSections.length; s++) {
    const sec = creditSections[s]!;
    const lw = bodyFont.widthOfTextAtSize(sec.label, labelSize);
    page.drawText(sec.label, {
      x: centerX - lw / 2,
      y,
      size: labelSize,
      font: bodyFont,
      color: TITLE_PAGE_LABEL_RGB,
    });
    y -= labelLineHeight;
    y -= gapLabelToValue;

    const valueWrapped = wrapPlainTextToWidth(sec.value, bodyFont, valueSize, maxTextW);
    for (const vline of valueWrapped) {
      const vw = bodyFont.widthOfTextAtSize(vline, valueSize);
      page.drawText(vline, {
        x: centerX - vw / 2,
        y,
        size: valueSize,
        font: bodyFont,
        color: TITLE_PAGE_BODY_RGB,
      });
      y -= valueLineHeight;
    }

    if (s < creditSections.length - 1) {
      y -= gapAfterSection;
    }
  }

  if (companyLines.length > 0) {
    if (creditSections.length > 0) {
      y -= gapCreditsToCompany;
    }
    for (let c = 0; c < companyLines.length; c++) {
      const wrapped = wrapPlainTextToWidth(companyLines[c]!, bodyFont, companySize, maxTextW);
      for (const cl of wrapped) {
        const cw = bodyFont.widthOfTextAtSize(cl, companySize);
        page.drawText(cl, {
          x: centerX - cw / 2,
          y,
          size: companySize,
          font: bodyFont,
          color: TITLE_PAGE_LABEL_RGB,
        });
        y -= companyLineHeight;
      }
      if (c < companyLines.length - 1) {
        y -= companyLineHeight * 0.25;
      }
    }
  }
}

export async function buildScreenplayPdfFromLayout(
  pages: readonly ScreenplayLayoutPage[],
  options?: BuildScreenplayPdfOptions,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const coverTitleFont = await doc.embedFont(StandardFonts.CourierBold);
  const titlePageInput = options?.titlePage ?? null;

  let docPageIndex = 0;

  if (titlePageInput) {
    const tp = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
    drawTitlePage(tp, coverTitleFont, font, titlePageInput);
    docPageIndex += 1;
  }

  const isEmptyBody =
    pages.length === 0 || (pages.length === 1 && pages[0]!.lines.length === 0);

  if (isEmptyBody) {
    const p = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
    drawFooter(p, font, docPageIndex - (titlePageInput ? 1 : 0));
  } else {
    for (let i = 0; i < pages.length; i++) {
      const p = doc.addPage([PAGE_W_PT, PAGE_H_PT]);
      const scriptPageIndex = docPageIndex - (titlePageInput ? 1 : 0);
      drawPage(p, font, pages[i]!, scriptPageIndex);
      docPageIndex += 1;
    }
  }

  return doc.save();
}

export async function buildScreenplayPdfFromBlocks(
  blocks: readonly ScreenplayExportBlock[],
  options?: BuildScreenplayPdfOptions,
): Promise<Uint8Array> {
  const pages = layoutScreenplayForExport(blocks);
  return buildScreenplayPdfFromLayout(pages, options);
}
