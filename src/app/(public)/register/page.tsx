import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { AuthScreen } from "@/features/product/components/auth-screen";
import { getAuthViewState, type RouteSearchParams } from "@/features/product/view-states";
import { getSafeRedirectPathFromSearchParam } from "@/lib/routing/safe-redirect-path";
import { getRequestSessionUser } from "@/lib/supabase/request-user";

type RegisterPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectAfterAuth = getSafeRedirectPathFromSearchParam(
    resolvedSearchParams.next,
    routes.projects,
  );

  const { user } = await getRequestSessionUser();

  if (user) {
    redirect(redirectAfterAuth);
  }

  return (
    <AuthScreen
      mode="register"
      redirectAfterAuth={redirectAfterAuth}
      viewState={getAuthViewState(resolvedSearchParams)}
    />
  );
}
