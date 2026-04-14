"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const initials = createInitials(userName) || "U";
  const menuId = useId();
  const menuButtonId = useMemo(() => `${menuId}-button`, [menuId]);
  const menuPopupId = useMemo(() => `${menuId}-popup`, [menuId]);
  const menuWrapperRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();
  const [isSigningOut, setIsSigningOut] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((current) => !current);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(undefined);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        setSignOutError("No se pudo cerrar sesión. Intenta de nuevo.");
        return;
      }

      closeMenu();
      router.replace(routes.login);
      router.refresh();
    } catch {
      setSignOutError("No se pudo cerrar sesión. Revisa tu configuración de Supabase.");
    } finally {
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const wrapper = menuWrapperRef.current;
      if (!wrapper) {
        return;
      }

      if (event.target instanceof Node && !wrapper.contains(event.target)) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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

        <div className={styles.userMenu} ref={menuWrapperRef}>
          <button
            id={menuButtonId}
            type="button"
            className={styles.userLink}
            title={userEmail ? userEmail : undefined}
            aria-label={`Cuenta — ${userName}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuPopupId}
            onClick={toggleMenu}
          >
            <span className={styles.userAvatar} aria-hidden="true">
              {initials}
            </span>
            <span className={styles.userName}>{userName}</span>
          </button>

          <div
            id={menuPopupId}
            className={cn(styles.userMenuPopup, isMenuOpen && styles.userMenuPopupOpen)}
            role="menu"
            aria-labelledby={menuButtonId}
          >
            <div className={styles.userMenuHeader} role="presentation">
              <div className={styles.userMenuIdentity}>
                <span className={styles.userMenuName}>{userName}</span>
                {userEmail ? <span className={styles.userMenuEmail}>{userEmail}</span> : null}
              </div>
            </div>

            <div className={styles.userMenuGroup} role="presentation">
              <Link href={routes.settings} className={styles.userMenuItem} role="menuitem" onClick={closeMenu}>
                Ajustes
              </Link>
              <div className={styles.userMenuItemInline} role="presentation">
                <span className={styles.userMenuItemLabel}>Tema</span>
                <ThemeToggle className={styles.userMenuThemeToggle} />
              </div>
            </div>

            <div className={styles.userMenuSeparator} role="separator" />

            <div className={styles.userMenuGroup} role="presentation">
              {signOutError ? (
                <p className={styles.userMenuNotice} role="alert">
                  {signOutError}
                </p>
              ) : null}
              <button
                type="button"
                className={styles.userMenuDangerItem}
                role="menuitem"
                disabled={isSigningOut}
                onClick={() => void handleSignOut()}
              >
                {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.dashboardMain}>{children}</main>
    </div>
  );
}
