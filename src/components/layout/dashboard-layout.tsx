"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/routes";
import { previewUser } from "@/features/product/preview-data";
import { cn } from "@/lib/cn";

import styles from "./shells.module.css";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOffline = searchParams.get("state") === "offline";

  return (
    <div className={styles.dashboardShell}>
      {isOffline ? (
        <div className={styles.connectionBanner} role="status">
          Sin conexion. Tus cambios se guardan localmente.
        </div>
      ) : null}

      <header className={styles.dashboardHeader}>
        <div className={styles.brandBlock}>
          <Link href={routes.projects} className={styles.brand}>
            SCRIPTUM
          </Link>
          <span className={styles.brandNote}>
            La vista principal prioriza abrir, escribir y exportar.
          </span>
        </div>

        <div className={styles.headerMid}>
          <nav className={styles.dashboardNav} aria-label="Dashboard navigation">
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

          <ThemeToggle />
        </div>

        <Link href={routes.settings} className={styles.userLink}>
          <span className={styles.userAvatar}>{previewUser.initials}</span>
          <span className={styles.userMeta}>
            <span className={styles.userName}>{previewUser.name}</span>
            <span className={styles.userSecondary}>{previewUser.email}</span>
          </span>
        </Link>
      </header>

      <main className={styles.dashboardMain}>{children}</main>
    </div>
  );
}
