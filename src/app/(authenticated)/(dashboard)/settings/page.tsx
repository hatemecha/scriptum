import { SettingsScreen } from "@/features/product/components/settings-screen";
import { getSettingsViewState, type RouteSearchParams } from "@/features/product/view-states";
import { ensureUserProfile, type UserAppProfile } from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<RouteSearchParams>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const viewState = getSettingsViewState(resolvedSearchParams);

  let accountEmail: string | null = null;
  let initialProfile: UserAppProfile | null = null;
  let profileLoadFailed = false;

  let passwordAuthAvailable = false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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
