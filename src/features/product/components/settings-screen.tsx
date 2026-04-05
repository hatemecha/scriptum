"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { type SettingsViewState } from "@/features/product/view-states";
import {
  formatProfilePlanLabel,
  type UserAppProfile,
  updateUserProfileDisplayName,
} from "@/features/user/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type SettingsScreenProps = {
  viewState: SettingsViewState;
  accountEmail: string | null;
  initialProfile: UserAppProfile | null;
  profileLoadFailed: boolean;
};

function defaultDisplayName(profile: UserAppProfile | null, email: string | null): string {
  const fromProfile = profile?.displayName?.trim();
  if (fromProfile) {
    return fromProfile;
  }
  const fromEmail = email?.split("@")[0]?.trim();
  return fromEmail ?? "";
}

function formatCreatedAtLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SettingsLoadingState() {
  return (
    <div className={styles.settingsLayout} aria-label="Cargando ajustes">
      {Array.from({ length: 2 }).map((_, index) => (
        <section key={`settings-skeleton-${index}`} className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Skeleton height="1rem" width="26%" radius="999px" />
            <Skeleton height="0.85rem" width="54%" radius="999px" />
          </div>

          <div className={styles.fieldRow}>
            <Skeleton height="3rem" radius="0.75rem" />
            <Skeleton height="0.9rem" width="48%" radius="999px" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function SettingsScreen({
  viewState,
  accountEmail,
  initialProfile,
  profileLoadFailed,
}: SettingsScreenProps) {
  const router = useRouter();
  const defaultName = defaultDisplayName(initialProfile, accountEmail);
  const [displayName, setDisplayName] = useState(defaultName);
  const [savedName, setSavedName] = useState(defaultName);
  const [nameError, setNameError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>();
  const { showToast } = useToast();

  const isOffline = viewState === "offline";
  const showProfileError = profileLoadFailed && !isOffline;

  if (viewState === "error" || showProfileError) {
    return (
      <StatePanel
        title="Algo salió mal"
        description="No pudimos cargar tus ajustes."
        secondaryDescription="Intenta recargar o vuelve al inicio."
        tone="danger"
        actions={
          <>
            <Link
              href={routes.settings}
              className="ui-button"
              data-size="md"
              data-variant="primary"
            >
              Reintentar
            </Link>
            <Link
              href={routes.projects}
              className="ui-button"
              data-size="md"
              data-variant="secondary"
            >
              Ir a proyectos
            </Link>
          </>
        }
      />
    );
  }

  const isForcedSaving = viewState === "saving";
  const canSave = displayName.trim().length > 0 && displayName.trim() !== savedName && !isOffline;
  const pending = isSaving || isForcedSaving;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (displayName.trim().length === 0) {
      setNameError("Este campo es obligatorio.");
      return;
    }

    if (isOffline) {
      setNameError("No se pudieron guardar los cambios.");
      return;
    }

    setNameError(undefined);
    setIsSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNameError("No hay sesión activa.");
        return;
      }

      const { error } = await updateUserProfileDisplayName(supabase, user.id, displayName.trim());

      if (error) {
        setNameError("No se pudo guardar. Intenta de nuevo.");
        return;
      }

      const trimmedName = displayName.trim();
      setSavedName(trimmedName);
      setDisplayName(trimmedName);
      showToast({
        description: "El nombre se actualizó correctamente.",
        title: "Guardado",
        tone: "success",
      });
    } catch {
      setNameError("No se pudo guardar. Revisa tu conexión.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setSignOutError(undefined);
    setIsSigningOut(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setSignOutError("No se pudo cerrar sesión. Intenta de nuevo.");
        return;
      }

      router.replace(routes.login);
      router.refresh();
    } catch {
      setSignOutError("No se pudo cerrar sesión. Revisa tu configuración de Supabase.");
    } finally {
      setIsSigningOut(false);
    }
  }

  const planLabel = initialProfile ? formatProfilePlanLabel(initialProfile.plan) : "—";
  const memberSinceLabel = initialProfile ? formatCreatedAtLabel(initialProfile.createdAt) : "—";
  const onboardingLabel = initialProfile?.onboardingCompletedAt
    ? formatCreatedAtLabel(initialProfile.onboardingCompletedAt)
    : "Pendiente";

  return (
    <section className={styles.pageSection}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <h1 className={styles.pageTitle}>Ajustes</h1>
        </div>
      </header>

      {isOffline ? (
        <p className={styles.inlineNotice}>
          Sin conexión. Puedes revisar la cuenta; los cambios quedan en pausa hasta volver la red.
        </p>
      ) : null}

      {viewState === "loading" ? (
        <SettingsLoadingState />
      ) : (
        <div className={styles.settingsLayout}>
          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Perfil</h2>
              <p className={styles.sectionDescription}>
                El nombre se usa en proyectos y exportaciones. El correo queda solo como referencia.
              </p>
            </header>

            <form className={styles.fieldRow} onSubmit={handleSave} noValidate>
              <div className={styles.fieldInline}>
                <Input
                  name="displayName"
                  autoComplete="name"
                  label="Nombre"
                  value={displayName}
                  error={nameError}
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setNameError(undefined);
                  }}
                  required
                  requiredLabel="Obligatorio"
                />

                <Button type="submit" variant="secondary" disabled={!canSave || pending}>
                  {pending ? "Guardando..." : "Guardar"}
                </Button>
              </div>

              <div className={styles.readonlyCard}>
                <span className={styles.readonlyLabel}>Correo</span>
                <span className={styles.readonlyValue}>{accountEmail ?? "—"}</span>
              </div>
            </form>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Cuenta</h2>
              <p className={styles.sectionDescription}>
                Plan, alta de cuenta y acceso.
              </p>
            </header>

            <div className={styles.readonlyCard}>
              <span className={styles.readonlyLabel}>Plan</span>
              <span className={styles.readonlyValue}>{planLabel}</span>
            </div>

            <div className={styles.readonlyCard}>
              <span className={styles.readonlyLabel}>Cuenta creada</span>
              <span className={styles.readonlyValue}>{memberSinceLabel}</span>
            </div>

            <div className={styles.readonlyCard}>
              <span className={styles.readonlyLabel}>Onboarding</span>
              <span className={styles.readonlyValue}>{onboardingLabel}</span>
            </div>

            <p className={styles.sectionNote}>
              Para cambiar la contraseña, usa recuperación de acceso.
            </p>

            {signOutError ? <p className={styles.inlineNotice}>{signOutError}</p> : null}

            <div className={styles.sectionFooter}>
              <Button
                type="button"
                variant="danger"
                size="md"
                disabled={isSigningOut}
                onClick={handleSignOut}
              >
                {isSigningOut ? "Cerrando..." : "Cerrar sesión"}
              </Button>
              <Link href={routes.home} className="ui-button" data-size="md" data-variant="ghost">
                Volver al inicio
              </Link>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
