"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";

import styles from "./shells.module.css";

type DashboardLayoutProps = {
  children: ReactNode;
  userEmail: string;
  userName: string;
};

function createInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

function DashboardOfflineBanner() {
  const searchParams = useSearchParams();
  const isOffline = searchParams.get("state") === "offline";

  if (!isOffline) {
    return null;
  }

  return (
    <div className={styles.connectionBanner} role="status">
      Sin conexión. Tus cambios se guardan en local.
    </div>
  );
}

export function DashboardLayout({ children, userEmail, userName }: DashboardLayoutProps) {
  const pathname = usePathname();
  const initials = createInitials(userName) || "U";

  return (
    <div className={styles.dashboardShell}>
      <Suspense fallback={null}>
        <DashboardOfflineBanner />
      </Suspense>

      <header className={styles.dashboardHeader}>
        <div className={styles.brandBlock}>
          <Link href={routes.projects} className={styles.brand}>
            SCRIPTUM
          </Link>
        </div>

        <nav className={styles.dashboardNav} aria-label="Navegación del panel">
          <Link
            href={routes.projects}
            className={cn(
              styles.dashboardLink,
              pathname === routes.projects && styles.dashboardLinkActive,
            )}
          >
            Proyectos
          </Link>
          <Link
            href={routes.settings}
            className={cn(
              styles.dashboardLink,
              pathname === routes.settings && styles.dashboardLinkActive,
            )}
          >
            Ajustes
          </Link>
        </nav>

        <Link
          href={routes.settings}
          className={styles.userLink}
          title={userEmail ? userEmail : undefined}
          aria-label={`Cuenta — ${userName}`}
        >
          <span className={styles.userAvatar} aria-hidden="true">
            {initials}
          </span>
          <span className={styles.userName}>{userName}</span>
        </Link>
      </header>

      <main className={styles.dashboardMain}>{children}</main>
    </div>
  );
}
