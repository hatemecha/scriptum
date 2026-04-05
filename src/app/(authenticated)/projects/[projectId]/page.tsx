import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { EditorScreen } from "@/features/product/components/editor-screen";
import {
  getEditorViewState,
  getExportViewState,
  type RouteSearchParams,
} from "@/features/product/view-states";
import { canAccessProjectEditor } from "@/features/projects/project-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectEditorPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

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

  return (
    <EditorScreen
      projectId={projectId}
      viewState={getEditorViewState(resolvedSearchParams)}
      initialExportState={getExportViewState(resolvedSearchParams)}
    />
  );
}
