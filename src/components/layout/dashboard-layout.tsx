import Link from "next/link";
import type { ReactNode } from "react";

import { dashboardNavigation, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import styles from "./shells.module.css";

const authenticatedGuardrails = [
  "The route file composes data and feature modules, not UI details.",
  "Server data stays route-scoped; ephemeral UI state stays local to the page.",
  "Global providers remain reserved for cross-cutting concerns such as theme, toast, and future session state.",
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.dashboardShell}>
      <aside className={styles.dashboardSidebar}>
        <div className={styles.sidebarSection}>
          <Link href={routes.home} className={styles.brand}>
            {siteConfig.name}
          </Link>
          <p className={styles.sidebarText}>
            Authenticated routes share one guard boundary, then fan out into dashboard or editor
            shells.
          </p>
        </div>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>Primary routes</p>

          <div className={styles.sidebarStack}>
            {dashboardNavigation.map((item) => (
              <Link key={item.href} href={item.href} className={styles.sidebarLink}>
                <span className={styles.sidebarLinkTitle}>{item.label}</span>
                <span className={styles.sidebarLinkDescription}>{item.description}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <p className={styles.sidebarLabel}>Guardrails</p>
          <ul className={styles.guardrailList}>
            {authenticatedGuardrails.map((guardrail) => (
              <li key={guardrail}>{guardrail}</li>
            ))}
          </ul>
        </div>
      </aside>

      <div className={styles.dashboardMain}>
        <header className={styles.dashboardHeader}>
          <div className={styles.dashboardHeaderCopy}>
            <p className={styles.layoutEyebrow}>Authenticated / Dashboard shell</p>
            <h1 className={styles.layoutTitle}>
              Projects and settings stay out of the editor chrome
            </h1>
            <p className={styles.layoutDescription}>
              This shell owns account-level navigation, empty/loading/error states, and feature
              entry points before the user enters a writing session.
            </p>
          </div>

          <div className={styles.dashboardHeaderActions}>
            <Link href={routes.playgroundFoundation} className={styles.utilityLink}>
              Playground
            </Link>
            <Link href={routes.projectEditor("sample-project")} className={styles.utilityLink}>
              Editor preview
            </Link>
          </div>
        </header>

        <div className={styles.dashboardContent}>{children}</div>
      </div>
    </div>
  );
}
