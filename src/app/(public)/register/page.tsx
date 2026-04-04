import { AuthScreen } from "@/features/product/components/auth-screen";
import { getAuthViewState, type RouteSearchParams } from "@/features/product/view-states";

type RegisterPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;

  return <AuthScreen mode="register" viewState={getAuthViewState(resolvedSearchParams)} />;
}
