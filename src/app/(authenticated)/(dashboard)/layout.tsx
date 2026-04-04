import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

type AuthenticatedDashboardLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedDashboardLayout({
  children,
}: AuthenticatedDashboardLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
