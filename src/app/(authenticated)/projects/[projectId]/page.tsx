import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { EditorScreen } from "@/features/product/components/editor-screen";
import { getEditorViewState, type RouteSearchParams } from "@/features/product/view-states";
import { getProjectEditorData } from "@/features/projects/project-snapshots";
import {
  resolveEditorAutosaveEnabled,
  resolveEditorTipsDetailLevel,
  resolveEditorTipsEnabled,
} from "@/features/user/profile";
import { buildLoginRedirectPath } from "@/lib/routing/safe-redirect-path";
import { getRequestAppUser } from "@/lib/supabase/request-user";

type ProjectEditorPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  let viewState = getEditorViewState(resolvedSearchParams);

  const { profile, supabase, user } = await getRequestAppUser();

  if (!user) {
    redirect(buildLoginRedirectPath(routes.projectEditor(projectId)));
  }

  let initialData = null;

  if (viewState !== "error" && viewState !== "loading") {
    const result = await getProjectEditorData(supabase, projectId);

    if (!result.data) {
      if (!result.error) {
        redirect(routes.projects);
      }
      viewState = "error";
    } else {
      initialData = result.data;
    }
  }

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
      prototypeMode={false}
      userId={user.id}
      viewState={viewState}
    />
  );
}
