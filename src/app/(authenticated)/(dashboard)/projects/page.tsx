import Link from "next/link";

import { routes } from "@/config/routes";
import {
  RouteBlueprintPage,
  type RouteBlueprintSection,
} from "@/features/architecture/components/route-blueprint-page";

const projectDashboardSections: RouteBlueprintSection[] = [
  {
    description: "This route is the landing surface after authentication.",
    items: [
      "Load the project collection at the route boundary and pass typed data into feature components.",
      "Keep create/rename/archive mutations inside feature modules instead of layout components.",
      "Use dedicated empty, loading, and error panels inside the main content region.",
    ],
    title: "Route responsibility",
  },
  {
    description: "State should only become global when more than one route needs it.",
    items: [
      "Project list data belongs to this route and its feature hooks.",
      "Search and filter controls stay local until they must sync to the URL.",
      "Cross-route concerns such as session identity remain outside the dashboard feature.",
    ],
    title: "State strategy",
  },
  {
    description: "User feedback must stay visible without entering editor chrome.",
    items: [
      "Empty states explain how to create the first screenplay.",
      "Recoverable network failures render inline with retry controls.",
      "Successful mutations can emit toasts because they are transient confirmations.",
    ],
    title: "UI feedback",
  },
];

export default function ProjectsPage() {
  return (
    <RouteBlueprintPage
      eyebrow="Authenticated / Dashboard"
      title="Projects route blueprint"
      description="The project list is the authenticated entry point. It owns collection loading, project-level actions, and empty/error states before the user enters an editor session."
      status="Dashboard route + collection boundary defined"
      sections={projectDashboardSections}
      aside={{
        items: [
          "Forms here stay lightweight: create project, rename project, archive project.",
          "The route should remain usable even when the editor is unavailable.",
          "Heavy editor dependencies should never load on this screen by default.",
        ],
        title: "Shell expectations",
      }}
      actions={
        <>
          <Link
            href={routes.projectEditor("sample-project")}
            className="ui-button"
            data-size="md"
            data-variant="primary"
          >
            Open editor shell
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
