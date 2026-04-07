import type { SupabaseClient } from "@supabase/supabase-js";

import { isPreviewDemoProjectId } from "@/features/product/preview-data";
import { type Database } from "@/lib/supabase/types";

/**
 * Returns true if the signed-in user may open `/projects/[projectId]` in the editor.
 * Projects must exist in `public.projects` with matching `owner_profile_id`.
 * Demo ids from preview/playground are never accepted here (use `/playground/editor/*`).
 */
export async function canAccessProjectEditor(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectId: string,
): Promise<boolean> {
  if (isPreviewDemoProjectId(projectId)) {
    return false;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_profile_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data != null;
}
