import type { ReactNode } from "react";

import { ThemePreferenceHydrator } from "@/components/theme/theme-preference-hydrator";
import { ensureUserProfile } from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedRootLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedRootLayout({ children }: AuthenticatedRootLayoutProps) {
  let profileTheme: "dark" | "light" | "system" | undefined;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await ensureUserProfile(supabase, user);
      profileTheme = profile?.preferences.theme;
    }
  } catch {
    profileTheme = undefined;
  }

  return (
    <>
      <ThemePreferenceHydrator profileTheme={profileTheme} />
      {children}
    </>
  );
}
