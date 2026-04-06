import { describe, expect, it } from "vitest";

import {
  chunkStringForPaste,
  DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE,
} from "@/features/editor/plain-text-paste-chunks";

describe("chunkStringForPaste", () => {
  it("returns empty array for empty string", () => {
    expect(chunkStringForPaste("", 100)).toEqual([]);
  });

  it("returns single-element array for short text", () => {
    expect(chunkStringForPaste("hello", 8192)).toEqual(["hello"]);
  });

  it("splits ASCII by UTF-16 length without losing characters", () => {
    const chunks = chunkStringForPaste("hello", 2);
    expect(chunks).toEqual(["he", "ll", "o"]);
    expect(chunks.join("")).toBe("hello");
  });

  it("handles long ASCII paste", () => {
    const body = "x".repeat(25_000);
    const chunks = chunkStringForPaste(body, DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join("")).toBe(body);
    for (const c of chunks.slice(0, -1)) {
      expect(c.length).toBeLessThanOrEqual(DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE);
    }
  });

  it("does not split surrogate pairs / emoji", () => {
    const text = "a🙂🏴󠁧󠁢󠁥󠁮󠁧󠁿b";
    const chunks = chunkStringForPaste(text, 2);
    expect(chunks.join("")).toBe(text);
    for (const ch of chunks) {
      expect([...ch].length).toBeGreaterThan(0);
    }
  });

  it("returns whole string when maxChunk is non-positive", () => {
    expect(chunkStringForPaste("abc", 0)).toEqual(["abc"]);
    expect(chunkStringForPaste("abc", -1)).toEqual(["abc"]);
  });
});
