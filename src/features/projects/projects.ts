import type { SupabaseClient } from "@supabase/supabase-js";

import { createScreenplayEntityId } from "@/features/screenplay/document-model";
import { type Database } from "@/lib/supabase/types";

export type UserProject = {
  id: string;
  ownerProfileId: string;
  title: string;
  author: string | null;
  description: string | null;
  language: string;
  status: string;
  currentSnapshotId: string | null;
  latestRevision: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  deletedAt: string | null;
};

export type CreateProjectInput = {
  title?: string;
  author?: string | null;
  description?: string | null;
  language?: string;
};

export type UpdateProjectMetadataInput = {
  title?: string;
  author?: string | null;
  description?: string | null;
  status?: string;
};

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function rowToProject(row: ProjectRow): UserProject {
  return {
    id: row.id,
    ownerProfileId: row.owner_profile_id,
    title: row.title,
    author: row.author,
    description: row.description,
    language: row.language,
    status: row.status,
    currentSnapshotId: row.current_snapshot_id,
    latestRevision: row.latest_revision,
    lastEditedAt: row.last_edited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    deletedAt: row.deleted_at,
  };
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateProjectInput = {},
): Promise<{ project: UserProject | null; error: Error | null }> {
  const projectId = createScreenplayEntityId("project");
  const title = input.title?.trim() || "Sin título";
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      id: projectId,
      owner_profile_id: userId,
      title,
      author: input.author?.trim() || null,
      description: input.description?.trim() || null,
      language: input.language?.trim() || "es",
      status: "draft",
      latest_revision: 0,
      last_edited_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { project: null, error: error ?? new Error("Failed to create project.") };
  }

  return { project: rowToProject(data), error: null };
}

export async function listUserProjects(
  supabase: SupabaseClient<Database>,
): Promise<{ projects: UserProject[]; error: Error | null }> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("last_edited_at", { ascending: false });

  if (error) {
    return { projects: [], error };
  }

  return { projects: (data ?? []).map(rowToProject), error: null };
}

export async function getProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<{ project: UserProject | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return { project: null, error };
  }

  if (!data) {
    return { project: null, error: null };
  }

  return { project: rowToProject(data), error: null };
}

export async function renameProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  title: string,
): Promise<{ project: UserProject | null; error: Error | null }> {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    return { project: null, error: new Error("El título no puede estar vacío.") };
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update({ title: trimmed, updated_at: now })
    .eq("id", projectId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) {
    return { project: null, error: error ?? new Error("Failed to rename project.") };
  }

  return { project: rowToProject(data), error: null };
}

export async function updateProjectMetadata(
  supabase: SupabaseClient<Database>,
  projectId: string,
  input: UpdateProjectMetadataInput,
): Promise<{ project: UserProject | null; error: Error | null }> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    if (trimmed.length === 0) {
      return { project: null, error: new Error("El título no puede estar vacío.") };
    }
    patch.title = trimmed;
  }

  if (input.author !== undefined) {
    patch.author = input.author?.trim() || null;
  }

  if (input.description !== undefined) {
    patch.description = input.description?.trim() || null;
  }

  if (input.status !== undefined) {
    patch.status = input.status;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) {
    return { project: null, error: error ?? new Error("Failed to update project metadata.") };
  }

  return { project: rowToProject(data), error: null };
}

export async function archiveProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<{ project: UserProject | null; error: Error | null }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update({ archived_at: now, updated_at: now })
    .eq("id", projectId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) {
    return { project: null, error: error ?? new Error("Failed to archive project.") };
  }

  return { project: rowToProject(data), error: null };
}

export async function unarchiveProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<{ project: UserProject | null; error: Error | null }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("projects")
    .update({ archived_at: null, updated_at: now })
    .eq("id", projectId)
    .is("deleted_at", null)
    .select("*")
    .single();

  if (error || !data) {
    return { project: null, error: error ?? new Error("Failed to unarchive project.") };
  }

  return { project: rowToProject(data), error: null };
}

export async function deleteProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc("soft_delete_project", {
    p_project_id: projectId,
  });

  if (error) {
    return { error };
  }

  return { error: null };
}

export function formatProjectStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Borrador";
    case "in-progress":
      return "En progreso";
    case "finished":
      return "Terminado";
    case "optioned":
      return "Opcionado";
    case "produced":
      return "Producido";
    default:
      return status;
  }
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatProjectLastEditedLabel(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < MINUTE) {
      return "hace unos segundos";
    }

    if (diff < HOUR) {
      const minutes = Math.floor(diff / MINUTE);
      return minutes === 1 ? "hace 1 minuto" : `hace ${minutes} minutos`;
    }

    if (diff < DAY) {
      const hours = Math.floor(diff / HOUR);
      return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
    }

    if (diff < 2 * DAY) {
      return "ayer";
    }

    if (diff < WEEK) {
      const days = Math.floor(diff / DAY);
      return `hace ${days} días`;
    }

    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}
