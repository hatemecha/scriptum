"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import styles from "./shells.module.css";

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOffline = searchParams.get("state") === "offline";
  const isHomeRoute = pathname === routes.home;
  const isLoginRoute = pathname === routes.login;
  const isRegisterRoute = pathname === routes.register;

  return (
    <div className={styles.publicShell}>
      {isOffline ? (
        <div className={styles.connectionBanner} role="status">
          Sin conexion. Tus cambios se guardan localmente.
        </div>
      ) : null}

      <header className={styles.publicHeader}>
        <div className={styles.brandBlock}>
          <Link href={routes.home} className={styles.brand}>
            {siteConfig.name}
          </Link>
          <span className={styles.brandNote}>
            Editor limpio, formato automatico, exportacion PDF.
          </span>
        </div>

        <div className={styles.headerMid}>
          <nav className={styles.publicNav} aria-label="Public navigation">
            {isHomeRoute ? (
              <Link href={routes.login} className={styles.navLink}>
                Iniciar sesion
              </Link>
            ) : isRegisterRoute ? (
              <Link href={routes.login} className={styles.navLink}>
                Iniciar sesion
              </Link>
            ) : null}

            {isHomeRoute ? (
              <Link
                href={routes.register}
                className="ui-button"
                data-size="md"
                data-variant="primary"
              >
                Crear cuenta
              </Link>
            ) : isLoginRoute ? (
              <Link href={routes.register} className={styles.navLink}>
                Crear cuenta
              </Link>
            ) : null}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className={styles.publicMain}>{children}</main>
    </div>
  );
}
