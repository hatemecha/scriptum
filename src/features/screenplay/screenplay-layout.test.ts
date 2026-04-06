import { describe, expect, it } from "vitest";

import { screenplayPageFormat } from "@/features/screenplay/format-rules";
import {
  layoutScreenplayForExport,
  wrapScreenplayPlainText,
} from "@/features/screenplay/screenplay-layout";
import { buildScreenplayPdfFromBlocks } from "@/features/screenplay/screenplay-pdf";

describe("wrapScreenplayPlainText", () => {
  it("wraps by word at column width", () => {
    expect(wrapScreenplayPlainText("hello world", 5)).toEqual(["hello", "world"]);
  });

  it("hard-breaks tokens longer than max", () => {
    expect(wrapScreenplayPlainText("abcdefghij", 4)).toEqual(["abcd", "efgh", "ij"]);
  });

  it("returns empty array for blank", () => {
    expect(wrapScreenplayPlainText("   ", 10)).toEqual([]);
  });

  it("wraps unicode and typographic punctuation without throwing", () => {
    const text = "José: «¿cómo?» — 中文 · ẞ";
    const lines = wrapScreenplayPlainText(text, 40);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join(" ")).toContain("José");
  });
});

describe("layoutScreenplayForExport", () => {
  it("returns one empty page for no blocks", () => {
    const pages = layoutScreenplayForExport([]);
    expect(pages).toEqual([{ lines: [] }]);
  });

  it("keeps scene heading with following line when possible", () => {
    const pages = layoutScreenplayForExport([
      { type: "scene-heading", text: "INT. HOUSE - DAY" },
      { type: "action", text: "Door." },
    ]);
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0]!.lines.some((l) => l.blockType === "scene-heading")).toBe(true);
    expect(pages[0]!.lines.some((l) => l.blockType === "action")).toBe(true);
  });

  it("inserts MORE and repeated cue when dialogue spans pages", () => {
    const long = "word ".repeat(500).trim();
    const pages = layoutScreenplayForExport([
      { type: "scene-heading", text: "INT. X - DAY" },
      { type: "character", text: "MARIA" },
      { type: "dialogue", text: long },
    ]);
    const flat = pages.flatMap((p) => p.lines.map((l) => l.text));
    expect(flat.some((t) => t === "(MORE)")).toBe(true);
    expect(flat.some((t) => t.includes("(CONT'D)"))).toBe(true);
  });

  it("does not exceed body line budget per page", () => {
    const pages = layoutScreenplayForExport([
      { type: "action", text: "x ".repeat(500) },
    ]);
    for (const p of pages) {
      expect(p.lines.length).toBeLessThanOrEqual(screenplayPageFormat.bodyHeightLines);
    }
  });

  it("lays out scene heading only (empty scene body)", () => {
    const pages = layoutScreenplayForExport([{ type: "scene-heading", text: "INT. VOID - NIGHT" }]);
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0]!.lines.some((l) => l.blockType === "scene-heading")).toBe(true);
  });

  it("lays out many scenes for long navigation / export stress", () => {
    const blocks: { type: "scene-heading" | "action"; text: string }[] = [];
    for (let i = 0; i < 80; i++) {
      blocks.push({ type: "scene-heading", text: `INT. PLACE ${i} - DAY` });
      blocks.push({ type: "action", text: "Beat.".repeat(12) });
    }
    const pages = layoutScreenplayForExport(blocks);
    expect(pages.length).toBeGreaterThan(5);
    for (const p of pages) {
      expect(p.lines.length).toBeLessThanOrEqual(screenplayPageFormat.bodyHeightLines);
    }
  });
});

describe("buildScreenplayPdfFromBlocks", () => {
  it("writes a PDF header", async () => {
    const bytes = await buildScreenplayPdfFromBlocks([{ type: "action", text: "Hello." }]);
    expect(bytes.length).toBeGreaterThan(400);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("%PDF");
  });

  it("builds a multi-page PDF for large documents without throwing", async () => {
    const blocks: { type: "scene-heading" | "action"; text: string }[] = [];
    for (let i = 0; i < 60; i++) {
      blocks.push({ type: "scene-heading", text: `INT. PLACE ${i} - DAY` });
      blocks.push({ type: "action", text: "Short beat.".repeat(8) });
    }
    const bytes = await buildScreenplayPdfFromBlocks(blocks);
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("%PDF");
    expect(bytes.length).toBeGreaterThan(6000);
  });
});
