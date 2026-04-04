import { ProjectsScreen } from "@/features/product/components/projects-screen";
import { getProjectsViewState, type RouteSearchParams } from "@/features/product/view-states";

type ProjectsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;

  return <ProjectsScreen viewState={getProjectsViewState(resolvedSearchParams)} />;
}
