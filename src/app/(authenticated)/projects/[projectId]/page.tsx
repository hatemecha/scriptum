import { EditorScreen } from "@/features/product/components/editor-screen";
import {
  getEditorViewState,
  getExportViewState,
  type RouteSearchParams,
} from "@/features/product/view-states";

type ProjectEditorPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectEditorPage({ params, searchParams }: ProjectEditorPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <EditorScreen
      projectId={projectId}
      viewState={getEditorViewState(resolvedSearchParams)}
      initialExportState={getExportViewState(resolvedSearchParams)}
    />
  );
}
