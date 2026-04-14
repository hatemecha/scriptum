import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getRequestAppUser } from "@/lib/supabase/request-user";

type AuthenticatedDashboardLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedDashboardLayout({
  children,
}: AuthenticatedDashboardLayoutProps) {
  let userDisplayName: string | null = null;
  let userEmail: string | null = null;

  try {
    const { profile, user } = await getRequestAppUser();

    if (user) {
      userEmail = user.email ?? null;
      userDisplayName = profile?.displayName ?? null;
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
