import Link from "next/link";

import { routes } from "@/config/routes";
import {
  RouteBlueprintPage,
  type RouteBlueprintSection,
} from "@/features/architecture/components/route-blueprint-page";

type ProjectEditorPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEditorPage({ params }: ProjectEditorPageProps) {
  const { projectId } = await params;

  const editorSections: RouteBlueprintSection[] = [
    {
      description:
        "The writing session needs a dedicated state boundary around the canonical document model.",
      items: [
        "Keep the screenplay document, selection, and command dispatch local to this route tree.",
        "Derive sidebar scene data from the canonical document model instead of mirroring it.",
        "Expose persistence and sync through adapters so Lexical never becomes the source of truth.",
      ],
      title: "State architecture",
    },
    {
      description:
        "The route should compose feature modules, while the feature owns editor mechanics.",
      items: [
        "UI primitives stay in `src/components/ui`; editor-specific visuals live under the editor feature.",
        "Keyboard rules, paste normalization, and block conversion stay in feature logic and commands.",
        "Service modules handle save/export/network concerns without leaking SDK details into the UI.",
      ],
      title: "UI and logic separation",
    },
    {
      description:
        "The editor cannot afford vague feedback because writing sessions are long-running.",
      items: [
        "Recoverable sync and export problems stay visible in the workspace status region.",
        "Block-level validation issues render inline near the affected content or controls.",
        "Only route-breaking failures should bubble to the authenticated error boundary.",
      ],
      title: "UI error policy",
    },
  ];

  return (
    <RouteBlueprintPage
      eyebrow="Authenticated / Editor"
      title={`Editor route blueprint for ${projectId}`}
      description="The editor route is intentionally isolated from the dashboard shell because writing, autosave, scene navigation, and export status need their own layout contract."
      status="Editor shell + route-local session boundary defined"
      sections={editorSections}
      aside={{
        items: [
          "Document session store",
          "Lexical adapter and commands",
          "Derived scene outline selectors",
          "Autosave and sync indicators",
          "Export modal trigger and feedback",
        ],
        title: "Route-owned concerns",
      }}
      actions={
        <>
          <Link href={routes.projects} className="ui-button" data-size="md" data-variant="primary">
            Back to projects
          </Link>
          <Link
            href={routes.settings}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Open settings route
          </Link>
        </>
      }
    />
  );
}
