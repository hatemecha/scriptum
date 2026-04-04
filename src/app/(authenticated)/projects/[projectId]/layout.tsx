import type { ReactNode } from "react";

import { EditorLayout } from "@/components/layout/editor-layout";

type ProjectEditorLayoutProps = {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEditorLayout({ children, params }: ProjectEditorLayoutProps) {
  const { projectId } = await params;

  return <EditorLayout projectId={projectId}>{children}</EditorLayout>;
}
