import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { SettingsScreen } from "@/features/product/components/settings-screen";
import { getSettingsViewState, type RouteSearchParams } from "@/features/product/view-states";
import { ensureUserProfile, type UserAppProfile } from "@/features/user/profile";
import { buildLoginRedirectPath } from "@/lib/routing/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const viewState = getSettingsViewState(resolvedSearchParams);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountEmail: string | null = null;
  let initialProfile: UserAppProfile | null = null;
  let profileLoadFailed = false;

  let passwordAuthAvailable = false;

  if (!user) {
    redirect(buildLoginRedirectPath(routes.settings));
  }

  try {
    accountEmail = user.email ?? null;
    passwordAuthAvailable = (user.identities ?? []).some(
      (identity) => identity.provider === "email",
    );
    const profile = await ensureUserProfile(supabase, user);
    if (profile) {
      initialProfile = profile;
    } else {
      profileLoadFailed = true;
    }
  } catch {
    profileLoadFailed = true;
  }

  return (
    <SettingsScreen
      viewState={viewState}
      accountEmail={accountEmail}
      initialProfile={initialProfile}
      passwordAuthAvailable={passwordAuthAvailable}
      profileLoadFailed={profileLoadFailed}
    />
  );
}
