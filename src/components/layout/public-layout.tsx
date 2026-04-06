"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

import styles from "./shells.module.css";

type PublicLayoutProps = {
  children: ReactNode;
};

/** `useSearchParams` must sit under `Suspense` to avoid static-render / hydration mismatches (Next.js CSR bailout). */
function PublicOfflineBanner() {
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

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const isHomeRoute = pathname === routes.home;
  const isLoginRoute = pathname === routes.login;
  const isRegisterRoute = pathname === routes.register;

  return (
    <div className={styles.publicShell}>
      <Suspense fallback={null}>
        <PublicOfflineBanner />
      </Suspense>

      <header className={styles.publicHeader}>
        <Link href={routes.home} className={styles.publicBrand}>
          {siteConfig.name}
        </Link>

        <nav className={styles.publicNav} aria-label="Navegación pública">
          {isHomeRoute || isRegisterRoute ? (
            <Link href={routes.login} className={styles.publicLink}>
              Iniciar sesión
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
            <Link href={routes.register} className={styles.publicLink}>
              Crear cuenta
            </Link>
          ) : null}

          <ThemeToggle />
        </nav>
      </header>

      <main className={styles.publicMain}>{children}</main>
    </div>
  );
}
