import { ProjectsScreen } from "@/features/product/components/projects-screen";
import { getProjectsViewState, type RouteSearchParams } from "@/features/product/view-states";
import { listUserProjects, type UserProject } from "@/features/projects/projects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  let viewState = getProjectsViewState(resolvedSearchParams);

  let projects: UserProject[] = [];

  if (viewState !== "error" && viewState !== "offline") {
    try {
      const supabase = await createSupabaseServerClient();
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
