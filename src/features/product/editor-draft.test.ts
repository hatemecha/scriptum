import { describe, expect, it } from "vitest";

import {
  clearStoredEditorDraft,
  readStoredEditorDraft,
  writeStoredEditorDraft,
  type StoredEditorDraft,
} from "./editor-draft";

const projectId = "project_test123";

describe("editor-draft", () => {
  it("returns null when no draft exists", () => {
    clearStoredEditorDraft(projectId);
    expect(readStoredEditorDraft(projectId)).toBeNull();
  });

  it("round-trips a valid draft", () => {
    clearStoredEditorDraft(projectId);
    const draft: StoredEditorDraft = {
      baseRevision: 3,
      blocks: [
        { type: "scene-heading", text: "INT. TEST" },
        { type: "action", text: "Beat." },
      ],
      documentId: "doc_abc",
      title: "Mi guion",
      updatedAt: "2026-04-06T12:00:00.000Z",
    };
    writeStoredEditorDraft(projectId, draft);
    expect(readStoredEditorDraft(projectId)).toEqual(draft);
    clearStoredEditorDraft(projectId);
    expect(readStoredEditorDraft(projectId)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    window.localStorage.setItem("scriptum-editor-draft:bad", "{not json");
    expect(readStoredEditorDraft("bad")).toBeNull();
    window.localStorage.removeItem("scriptum-editor-draft:bad");
  });

  it("returns null for malformed payload", () => {
    window.localStorage.setItem(
      "scriptum-editor-draft:malformed",
      JSON.stringify({ title: 123, baseRevision: "x" }),
    );
    expect(readStoredEditorDraft("malformed")).toBeNull();
    window.localStorage.removeItem("scriptum-editor-draft:malformed");
  });
});
