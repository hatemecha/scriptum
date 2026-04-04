import type { ReactNode } from "react";

type EditorLayoutProps = {
  children: ReactNode;
  projectId: string;
};

export function EditorLayout({ children }: EditorLayoutProps) {
  return children;
}
