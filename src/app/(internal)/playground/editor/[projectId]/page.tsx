import { EditorScreen } from "@/features/product/components/editor-screen";
import { getEditorViewState, type RouteSearchParams } from "@/features/product/view-states";
import {
  resolveEditorAutosaveEnabled,
  resolveEditorTipsDetailLevel,
  resolveEditorTipsEnabled,
} from "@/features/user/profile";

type PlaygroundEditorPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<RouteSearchParams>;
};

/** Internal editor demos with `preview-data` seeds; not backed by `public.projects`. */
export default async function PlaygroundEditorPage({
  params,
  searchParams,
}: PlaygroundEditorPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;
  const viewState = getEditorViewState(resolvedSearchParams);

  return (
    <EditorScreen
      editorAutosaveEnabled={resolveEditorAutosaveEnabled(undefined)}
      editorTipsDetailLevel={resolveEditorTipsDetailLevel(undefined)}
      editorTipsEnabled={resolveEditorTipsEnabled(undefined)}
      initialData={null}
      projectId={projectId}
      prototypeMode={true}
      userId="00000000-0000-0000-0000-000000000000"
      viewState={viewState}
    />
  );
}
