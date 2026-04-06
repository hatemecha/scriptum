/**
 * Maximum UTF-16 code units per Lexical `insertRawText` chunk when pasting large plain text.
 * Keeps the main thread responsive and avoids huge single updates.
 */
export const DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE = 8192 as const;

/**
 * Split plain text into chunks that never split a Unicode scalar value (uses `for…of` iteration).
 * `maxChunkUtf16Units` counts UTF-16 code units (JavaScript string `.length`), matching Lexical's string model.
 */
export function chunkStringForPaste(text: string, maxChunkUtf16Units: number): string[] {
  if (text.length === 0) {
    return [];
  }
  if (maxChunkUtf16Units <= 0) {
    return [text];
  }

  const chunks: string[] = [];
  let current = "";

  for (const char of text) {
    const candidate = current + char;
    if (candidate.length > maxChunkUtf16Units && current.length > 0) {
      chunks.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}
