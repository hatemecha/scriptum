import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { ProjectsScreen } from "@/features/product/components/projects-screen";
import { getProjectsViewState, type RouteSearchParams } from "@/features/product/view-states";
import { listUserProjects, type UserProject } from "@/features/projects/projects";
import { buildLoginRedirectPath } from "@/lib/routing/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  let viewState = getProjectsViewState(resolvedSearchParams);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: UserProject[] = [];

  if (!user) {
    redirect(buildLoginRedirectPath(routes.projects));
  }

  if (viewState !== "error" && viewState !== "offline") {
    try {
      const result = await listUserProjects(supabase);

      if (result.error) {
        viewState = "error";
      } else {
        projects = result.projects;

        if (projects.length === 0 && viewState === "default") {
          viewState = "empty";
        }
      }
    } catch {
      viewState = "error";
    }
  }

  return <ProjectsScreen viewState={viewState} projects={projects} />;
}
