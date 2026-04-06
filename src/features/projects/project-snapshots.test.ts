import { describe, expect, it } from "vitest";

import {
  isSnapshotRevisionConflictError,
  normalizeSerializedBlocksForPersist,
} from "./project-snapshots";

describe("normalizeSerializedBlocksForPersist", () => {
  it("trims whitespace and drops only-whitespace blocks", () => {
    expect(
      normalizeSerializedBlocksForPersist([
        { type: "action", text: "  hola  " },
        { type: "action", text: "   \n\t " },
      ]),
    ).toEqual([{ type: "action", text: "hola" }]);
  });

  it("returns a single empty action when all blocks are empty", () => {
    expect(normalizeSerializedBlocksForPersist([])).toEqual([{ type: "action", text: "" }]);
    expect(
      normalizeSerializedBlocksForPersist([
        { type: "dialogue", text: " " },
        { type: "action", text: "" },
      ]),
    ).toEqual([{ type: "action", text: "" }]);
  });

  it("preserves unicode while normalizing whitespace", () => {
    expect(
      normalizeSerializedBlocksForPersist([
        { type: "dialogue", text: "  José dice: «hola» —  \n  sí. 中文  " },
      ]),
    ).toEqual([{ type: "dialogue", text: "José dice: «hola» — sí. 中文" }]);
  });
});

describe("isSnapshotRevisionConflictError", () => {
  it("detects Postgres unique violation code", () => {
    expect(isSnapshotRevisionConflictError({ code: "23505", message: "duplicate" })).toBe(true);
  });

  it("detects revision conflict phrasing", () => {
    expect(
      isSnapshotRevisionConflictError({
        message: "duplicate key value violates unique constraint document_snapshots_revision",
      }),
    ).toBe(true);
    expect(
      isSnapshotRevisionConflictError({
        message: "Unique revision for project",
      }),
    ).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isSnapshotRevisionConflictError({ message: "permission denied" })).toBe(false);
    expect(isSnapshotRevisionConflictError(null)).toBe(false);
    expect(isSnapshotRevisionConflictError(new Error("network down"))).toBe(false);
  });
});
