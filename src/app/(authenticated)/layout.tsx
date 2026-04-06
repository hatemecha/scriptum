import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ThemePreferenceHydrator } from "@/components/theme/theme-preference-hydrator";
import { routes } from "@/config/routes";
import { ensureUserProfile } from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedRootLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedRootLayout({ children }: AuthenticatedRootLayoutProps) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(routes.login);
    }

    const profile = await ensureUserProfile(supabase, user);
    const profileTheme = profile?.preferences.theme;

    return (
      <>
        <ThemePreferenceHydrator profileTheme={profileTheme} />
        {children}
      </>
    );
  } catch {
    redirect(routes.login);
  }
}
