import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { EditorScreen } from "@/features/product/components/editor-screen";
import {
  getEditorViewState,
  type RouteSearchParams,
} from "@/features/product/view-states";
import { isAuthenticatedEditorPrototypeProjectId } from "@/features/product/preview-data";
import { canAccessProjectEditor } from "@/features/projects/project-access";
import { getProjectEditorData } from "@/features/projects/project-snapshots";
import {
  ensureUserProfile,
  resolveEditorAutosaveEnabled,
  resolveEditorTipsDetailLevel,
  resolveEditorTipsEnabled,
} from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectEditorPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  let viewState = getEditorViewState(resolvedSearchParams);
  const isPrototypeProject = isAuthenticatedEditorPrototypeProjectId(projectId);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(routes.login);
  }

  const allowed = await canAccessProjectEditor(supabase, user.id, projectId);

  if (!allowed) {
    redirect(routes.projects);
  }

  let initialData = null;

  if (!isPrototypeProject && viewState !== "error" && viewState !== "loading") {
    const result = await getProjectEditorData(supabase, projectId);

    if (result.error || !result.data) {
      viewState = "error";
    } else {
      initialData = result.data;
    }
  }

  const profile = await ensureUserProfile(supabase, user);
  const editorTipsEnabled = resolveEditorTipsEnabled(profile?.preferences);
  const editorTipsDetailLevel = resolveEditorTipsDetailLevel(profile?.preferences);
  const editorAutosaveEnabled = resolveEditorAutosaveEnabled(profile?.preferences);

  return (
    <EditorScreen
      editorAutosaveEnabled={editorAutosaveEnabled}
      editorTipsDetailLevel={editorTipsDetailLevel}
      editorTipsEnabled={editorTipsEnabled}
      initialData={initialData}
      projectId={projectId}
      prototypeMode={isPrototypeProject}
      userId={user.id}
      viewState={viewState}
    />
  );
}
