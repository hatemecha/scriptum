import { AuthScreen } from "@/features/product/components/auth-screen";
import { getAuthViewState, type RouteSearchParams } from "@/features/product/view-states";

type LoginPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return <AuthScreen mode="login" viewState={getAuthViewState(resolvedSearchParams)} />;
}
