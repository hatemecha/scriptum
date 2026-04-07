import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ensureUserProfile, type UserAppProfile } from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedDashboardLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedDashboardLayout({
  children,
}: AuthenticatedDashboardLayoutProps) {
  let userDisplayName: string | null = null;
  let userEmail: string | null = null;
  let userProfile: UserAppProfile | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email ?? null;
      userProfile = await ensureUserProfile(supabase, user);
      userDisplayName = userProfile?.displayName ?? null;
    }
  } catch {
  }

  return (
    <DashboardLayout
      userName={userDisplayName || userEmail?.split("@")[0] || "Usuario"}
      userEmail={userEmail || ""}
    >
      {children}
    </DashboardLayout>
  );
}
