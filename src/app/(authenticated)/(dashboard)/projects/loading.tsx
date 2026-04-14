import { ProjectsScreen } from "@/features/product/components/projects-screen";

export default function ProjectsLoadingPage() {
  return <ProjectsScreen projects={[]} viewState="loading" />;
}
