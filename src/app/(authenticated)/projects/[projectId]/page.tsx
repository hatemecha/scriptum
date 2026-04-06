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

  return (
    <EditorScreen
      initialData={initialData}
      projectId={projectId}
      prototypeMode={isPrototypeProject}
      viewState={viewState}
    />
  );
}
