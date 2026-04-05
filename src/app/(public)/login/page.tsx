import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { AuthScreen } from "@/features/product/components/auth-screen";
import { getAuthViewState, type RouteSearchParams } from "@/features/product/view-states";
import { getSafeRedirectPathFromSearchParam } from "@/lib/routing/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectAfterAuth = getSafeRedirectPathFromSearchParam(
    resolvedSearchParams.next,
    routes.projects,
  );

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectAfterAuth);
  }

  return (
    <AuthScreen
      mode="login"
      redirectAfterAuth={redirectAfterAuth}
      viewState={getAuthViewState(resolvedSearchParams)}
    />
  );
}
