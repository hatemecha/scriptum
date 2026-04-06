import { type SerializedEditorBlock } from "@/features/projects/project-snapshots";

const EDITOR_DRAFT_STORAGE_PREFIX = "scriptum-editor-draft:";

export type StoredEditorDraft = {
  baseRevision: number;
  blocks: readonly SerializedEditorBlock[];
  documentId: string | null;
  title: string;
  updatedAt: string;
};

function getEditorDraftStorageKey(projectId: string): string {
  return `${EDITOR_DRAFT_STORAGE_PREFIX}${projectId}`;
}

function isStoredEditorDraft(value: unknown): value is StoredEditorDraft {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.baseRevision === "number" &&
    typeof draft.title === "string" &&
    typeof draft.updatedAt === "string" &&
    (typeof draft.documentId === "string" || draft.documentId === null) &&
    Array.isArray(draft.blocks)
  );
}

export function readStoredEditorDraft(projectId: string): StoredEditorDraft | null {
  const rawDraft = window.localStorage.getItem(getEditorDraftStorageKey(projectId));

  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as unknown;

    return isStoredEditorDraft(parsedDraft) ? parsedDraft : null;
  } catch {
    return null;
  }
}

export function writeStoredEditorDraft(projectId: string, draft: StoredEditorDraft): void {
  window.localStorage.setItem(getEditorDraftStorageKey(projectId), JSON.stringify(draft));
}

export function clearStoredEditorDraft(projectId: string): void {
  window.localStorage.removeItem(getEditorDraftStorageKey(projectId));
}
