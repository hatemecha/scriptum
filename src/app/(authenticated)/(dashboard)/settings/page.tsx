import { SettingsScreen } from "@/features/product/components/settings-screen";
import { getSettingsViewState, type RouteSearchParams } from "@/features/product/view-states";

type SettingsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedSearchParams = await searchParams;

  return <SettingsScreen viewState={getSettingsViewState(resolvedSearchParams)} />;
}
