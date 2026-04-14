import type { ReactNode } from "react";

import { ThemePreferenceHydrator } from "@/components/theme/theme-preference-hydrator";
import { getRequestAppUser } from "@/lib/supabase/request-user";

type AuthenticatedRootLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedRootLayout({ children }: AuthenticatedRootLayoutProps) {
  let profileTheme: "dark" | "light" | "system" | undefined;

  try {
    const { profile } = await getRequestAppUser();
    profileTheme = profile?.preferences.theme;
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
