import Link from "next/link";
import type { ReactNode } from "react";

import { publicNavigation, routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import styles from "./shells.module.css";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className={styles.publicShell}>
      <header className={styles.publicHeader}>
        <div className={styles.publicBrandBlock}>
          <Link href={routes.home} className={styles.brand}>
            {siteConfig.name}
          </Link>
          <p className={styles.publicNote}>
            Paper-first screenplay writing with public routes that stay light and focused.
          </p>
        </div>

        <nav className={styles.publicNav} aria-label="Public navigation">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}

          <Link href={routes.playgroundFoundation} className={styles.navLink}>
            Playground
          </Link>
        </nav>
      </header>

      <main className={styles.publicMain}>{children}</main>
    </div>
  );
}
