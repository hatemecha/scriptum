import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getOrderedScreenplayBlocks,
  createScreenplayDocument,
  type ScreenplayDocument,
} from "@/features/screenplay/document-model";
import { hasIdPrefix } from "@/features/screenplay/document-core";
import { getScreenplayDocumentValidationErrors } from "@/features/screenplay/document-validation";
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import { type Json, type Database } from "@/lib/supabase/types";

import {
  normalizeExportTitlePageFields,
  normalizeProjectAuthor,
  normalizeProjectDescription,
  normalizeProjectLanguage,
  normalizeProjectStatus,
  normalizeProjectTitle,
  type ProjectLanguage,
  type ProjectStatus,
} from "./project-contract";
import { getProject, rowToProject, type UserProject } from "./projects";

type SnapshotRow = Database["public"]["Tables"]["document_snapshots"]["Row"];

export type SerializedEditorBlock = {
  text: string;
  type: ScreenplayBlockType;
};

export type PersistedProjectEditorData = {
  blocks: readonly SerializedEditorBlock[];
  documentId: string | null;
  project: UserProject;
  revision: number;
  snapshotId: string | null;
};

export type SaveProjectSnapshotInput = {
  blocks: readonly SerializedEditorBlock[];
  description?: string | null;
  documentId: string | null;
  language?: ProjectLanguage;
  project: UserProject;
  snapshotKind?: "autosave" | "manual-save";
  status?: ProjectStatus;
  title?: string;
};

/**
 * Elimina bloques sin texto antes de persistir (p. ej. párrafos vacíos que deja Lexical).
 * Si no queda ninguno, mantiene el único caso permitido: una acción vacía.
 */
export function normalizeSerializedBlocksForPersist(
  blocks: readonly SerializedEditorBlock[],
): SerializedEditorBlock[] {
  const nonEmpty = blocks.filter((b) => b.text.replace(/\s+/g, " ").trim().length > 0);
  if (nonEmpty.length === 0) {
    return [{ type: "action", text: "" }];
  }
  return nonEmpty.map((b) => ({
    type: b.type,
    text: b.text.replace(/\s+/g, " ").trim(),
  }));
}

function isRecord(value: Json | unknown): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createSnapshotId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `snapshot_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
  }

  return `snapshot_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function parsePersistedScreenplayDocument(value: Json): ScreenplayDocument | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isRecord(value.schema) ||
    !isRecord(value.document) ||
    !isRecord(value.project) ||
    !isRecord(value.content) ||
    !isRecord(value.indexes) ||
    !isRecord(value.sync)
  ) {
    return null;
  }

  const document = value as unknown as ScreenplayDocument;
  const validationErrors = getScreenplayDocumentValidationErrors(document, { mode: "persisted" });

  return validationErrors.length === 0 ? document : null;
}

function rowToEditorData(project: UserProject, snapshot: SnapshotRow | null): PersistedProjectEditorData {
  if (!snapshot) {
    return {
      blocks: [],
      documentId: null,
      project,
      revision: 0,
      snapshotId: null,
    };
  }

  const document = parsePersistedScreenplayDocument(snapshot.document_data);

  if (!document) {
    throw new Error("Active document snapshot is invalid.");
  }

  return {
    blocks: getOrderedScreenplayBlocks(document).map((block) => ({
      text: block.text,
      type: block.type,
    })),
    documentId: document.document.id,
    project: {
      ...project,
      author: document.project.author,
      description: document.project.description,
      language: normalizeProjectLanguage(document.project.language),
      status: normalizeProjectStatus(document.project.status),
      title: document.project.title,
    },
    revision: document.document.revision,
    snapshotId: snapshot.id,
  };
}

export async function getProjectEditorData(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<{ data: PersistedProjectEditorData | null; error: Error | null }> {
  const { project, error: projectError } = await getProject(supabase, projectId);

  if (projectError || !project) {
    return { data: null, error: projectError };
  }

  if (!project.currentSnapshotId) {
    return { data: rowToEditorData(project, null), error: null };
  }

  const { data: snapshot, error } = await supabase
    .from("document_snapshots")
    .select("*")
    .eq("project_id", projectId)
    .eq("id", project.currentSnapshotId)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  try {
    return { data: rowToEditorData(project, snapshot), error: null };
  } catch (snapshotError) {
    return {
      data: null,
      error:
        snapshotError instanceof Error
          ? snapshotError
          : new Error("Active document snapshot is invalid."),
    };
  }
}

export function isSnapshotRevisionConflictError(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: string; message?: string };
  if (record.code === "23505") {
    return true;
  }

  const message = (record.message ?? "").toLowerCase();

  return (
    message.includes("revision") &&
    (message.includes("unique") || message.includes("duplicate") || message.includes("document_snapshots"))
  );
}

async function fetchMaxSnapshotRevision(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("document_snapshots")
    .select("revision")
    .eq("project_id", projectId)
    .order("revision", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || data == null) {
    return null;
  }

  return data.revision;
}

export async function saveProjectSnapshot(
  supabase: SupabaseClient<Database>,
  input: SaveProjectSnapshotInput,
): Promise<{
  data: PersistedProjectEditorData | null;
  error: Error | null;
}> {
  try {
    const title = normalizeProjectTitle(input.title ?? input.project.title, "Sin título");
    const author = normalizeProjectAuthor(input.project.author);
    const exportTitlePage = normalizeExportTitlePageFields(input.project.exportTitlePage);
    const description = normalizeProjectDescription(input.description ?? input.project.description);
    const language = normalizeProjectLanguage(input.language ?? input.project.language);
    const status = normalizeProjectStatus(input.status ?? input.project.status);
    const documentId =
      input.documentId && hasIdPrefix(input.documentId, "doc") ? input.documentId : undefined;

    const maxAttempts = 5;
    let revision = input.project.latestRevision + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const now = new Date().toISOString();

      const blocksForPersist = normalizeSerializedBlocksForPersist(input.blocks);

      const document = createScreenplayDocument({
        id: documentId,
        revision,
        updatedAt: now,
        project: {
          id: input.project.id as `project_${string}`,
          title,
          author,
          description,
          language,
          status,
          createdAt: input.project.createdAt,
          updatedAt: now,
        },
        blocks: blocksForPersist.map((block) => ({
          text: block.text,
          type: block.type,
        })),
        sync: {
          baseRevision: revision,
          lastSyncedAt: now,
          lastSyncedRevision: revision,
          status: "synced",
        },
      });

      const validationErrors = getScreenplayDocumentValidationErrors(document, { mode: "persisted" });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const snapshotId = createSnapshotId();
      const { data: updatedProjectRow, error: saveError } = await supabase.rpc("save_project_snapshot", {
        p_author: author,
        p_description: description,
        p_document_data: document as unknown as Json,
        p_document_id: document.document.id,
        p_document_schema_version: document.schema.version,
        p_export_title_page: exportTitlePage as unknown as Json,
        p_language: language,
        p_project_id: input.project.id,
        p_revision: document.document.revision,
        p_saved_at: now,
        p_snapshot_id: snapshotId,
        p_snapshot_kind: input.snapshotKind ?? "autosave",
        p_status: status,
        p_title: title,
      });

      if (saveError) {
        if (isSnapshotRevisionConflictError(saveError) && attempt < maxAttempts - 1) {
          const maxRev = await fetchMaxSnapshotRevision(supabase, input.project.id);
          if (maxRev != null) {
            revision = Math.max(input.project.latestRevision, maxRev) + 1;
          } else {
            revision += 1;
          }
          continue;
        }

        return { data: null, error: saveError };
      }

      return {
        data: rowToEditorData(
          rowToProject(updatedProjectRow),
          {
            created_at: now,
            document_data: document as unknown as Json,
            document_id: document.document.id,
            document_schema_version: document.schema.version,
            id: updatedProjectRow.current_snapshot_id ?? snapshotId,
            owner_profile_id: updatedProjectRow.owner_profile_id,
            project_id: updatedProjectRow.id,
            revision: document.document.revision,
            snapshot_kind: input.snapshotKind ?? "autosave",
          },
        ),
        error: null,
      };
    }

    return {
      data: null,
      error: new Error("Could not allocate a new document revision after repeated conflicts."),
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to save project snapshot."),
    };
  }
}
