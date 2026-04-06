"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { type SettingsViewState } from "@/features/product/view-states";
import {
  formatProfilePlanLabel,
  mergeUserProfilePreferences,
  resolveEditorAutosaveEnabled,
  resolveEditorTipsDetailLevel,
  resolveEditorTipsEnabled,
  type EditorTipsDetailLevel,
  type UserAppProfile,
  updateUserProfileDisplayName,
} from "@/features/user/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { EditorGlossaryModal } from "./editor-glossary-modal";
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
  const [editorTipsEnabled, setEditorTipsEnabled] = useState(() =>
    resolveEditorTipsEnabled(initialProfile?.preferences),
  );
  const [editorTipsDetailLevel, setEditorTipsDetailLevel] = useState<EditorTipsDetailLevel>(() =>
    resolveEditorTipsDetailLevel(initialProfile?.preferences),
  );
  const [editorAutosaveEnabled, setEditorAutosaveEnabled] = useState(() =>
    resolveEditorAutosaveEnabled(initialProfile?.preferences),
  );
  const [isEditorTipsSaving, setIsEditorTipsSaving] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setEditorTipsEnabled(resolveEditorTipsEnabled(initialProfile?.preferences));
    setEditorTipsDetailLevel(resolveEditorTipsDetailLevel(initialProfile?.preferences));
    setEditorAutosaveEnabled(resolveEditorAutosaveEnabled(initialProfile?.preferences));
  }, [initialProfile]);

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

  async function handleEditorTipsChange(nextEnabled: boolean) {
    if (isOffline || isEditorTipsSaving) {
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { error } = await mergeUserProfilePreferences(supabase, user.id, {
        editorTipsEnabled: nextEnabled,
      });

      if (error) {
        showToast({
          description: "No se pudo guardar. Intenta de nuevo.",
          title: "Preferencia no guardada",
          tone: "error",
        });
        return;
      }

      setEditorTipsEnabled(nextEnabled);
      showToast({
        description: nextEnabled
          ? "Verás de nuevo el glosario y las pistas según tu nivel de ayuda."
          : "El editor queda sin ayudas visibles; podés reactivarlas en Ajustes → Editor.",
        title: "Preferencia guardada",
        tone: "success",
      });
      router.refresh();
    } catch {
      showToast({
        description: "Revisa tu conexión e inténtalo de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
    }
  }

  async function handleEditorTipsDetailLevelChange(nextLevel: EditorTipsDetailLevel) {
    if (isOffline || isEditorTipsSaving || editorTipsDetailLevel === nextLevel) {
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { error } = await mergeUserProfilePreferences(supabase, user.id, {
        editorTipsDetailLevel: nextLevel,
      });

      if (error) {
        showToast({
          description: "No se pudo guardar. Intenta de nuevo.",
          title: "Preferencia no guardada",
          tone: "error",
        });
        return;
      }

      setEditorTipsDetailLevel(nextLevel);
      showToast({
        description:
          nextLevel === "full"
            ? "Verás pistas al escribir y tooltips con definiciones."
            : "Quedan el glosario manual y el lienzo más limpio, sin franja de pistas.",
        title: "Preferencia guardada",
        tone: "success",
      });
      router.refresh();
    } catch {
      showToast({
        description: "Revisa tu conexión e inténtalo de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
    }
  }

  async function handleEditorAutosaveChange(nextEnabled: boolean) {
    if (isOffline || isEditorTipsSaving || editorAutosaveEnabled === nextEnabled) {
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { error } = await mergeUserProfilePreferences(supabase, user.id, {
        editorAutosaveEnabled: nextEnabled,
      });

      if (error) {
        showToast({
          description: "No se pudo guardar. Intenta de nuevo.",
          title: "Preferencia no guardada",
          tone: "error",
        });
        return;
      }

      setEditorAutosaveEnabled(nextEnabled);
      showToast({
        description: nextEnabled
          ? "El guión puede sincronizarse al pulsar Intro y al editar el título."
          : "Usá «Guardar» en el editor o confirmá al ir a Proyectos o Ajustes.",
        title: "Preferencia guardada",
        tone: "success",
      });
      router.refresh();
    } catch {
      showToast({
        description: "Revisa tu conexión e inténtalo de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
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
    <>
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
              <h2 className={styles.sectionTitle}>Apariencia</h2>
              <p className={styles.sectionDescription}>
                El tema oscuro es el predeterminado. Cambiá a claro cuando te resulte más cómodo.
              </p>
            </header>
            <div className={styles.appearanceRow}>
              <span className={styles.readonlyLabel}>Tema de la interfaz</span>
              <ThemeToggle />
            </div>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Editor</h2>
              <p className={styles.sectionDescription}>
                Por defecto el guión no se sube solo: usá «Guardar» en la barra del editor o activá el
                autoguardado abajo. Podés apagar las ayudas o dejarlas en modo mínimo (glosario manual).
              </p>
            </header>
            <div className={styles.settingsToggleRow}>
              <label className={styles.settingsToggleLabel} htmlFor="settings-editor-autosave">
                <input
                  id="settings-editor-autosave"
                  type="checkbox"
                  checked={editorAutosaveEnabled}
                  disabled={isOffline || isEditorTipsSaving}
                  onChange={(event) => void handleEditorAutosaveChange(event.target.checked)}
                />
                <span className={styles.settingsToggleCopy}>
                  <span className={styles.settingsToggleTitle}>Autoguardado al escribir</span>
                  <span className={styles.settingsToggleDescription}>
                    Sincroniza al pulsar Intro en una línea y tras retocar el título (con un breve
                    retraso). Si está desactivado, guardá con el botón del editor o al salir te
                    preguntamos.
                  </span>
                </span>
              </label>
            </div>
            <div className={styles.settingsToggleRow}>
              <label className={styles.settingsToggleLabel} htmlFor="settings-editor-tips">
                <input
                  id="settings-editor-tips"
                  type="checkbox"
                  checked={editorTipsEnabled}
                  disabled={isOffline || isEditorTipsSaving}
                  onChange={(event) => void handleEditorTipsChange(event.target.checked)}
                />
                <span className={styles.settingsToggleCopy}>
                  <span className={styles.settingsToggleTitle}>Mostrar ayudas en el editor</span>
                  <span className={styles.settingsToggleDescription}>
                    Incluye la barra de ayudas con glosario en el editor. Desactivalo para un lienzo sin ayudas.
                  </span>
                </span>
              </label>
            </div>
            {editorTipsEnabled ? (
              <div className={styles.settingsRadioGroup} role="group" aria-label="Nivel de ayuda">
                <span className={styles.settingsRadioGroupLabel}>Nivel</span>
                <label className={styles.settingsRadioRow} htmlFor="settings-editor-tips-full">
                  <input
                    id="settings-editor-tips-full"
                    type="radio"
                    name="editor-tips-detail"
                    checked={editorTipsDetailLevel === "full"}
                    disabled={isOffline || isEditorTipsSaving}
                    onChange={() => void handleEditorTipsDetailLevelChange("full")}
                  />
                  <span className={styles.settingsRadioCopy}>
                    <span className={styles.settingsRadioTitle}>Completo</span>
                    <span className={styles.settingsRadioDescription}>
                      Pistas al escribir, mensajes breves de formato y tooltips con definiciones.
                    </span>
                  </span>
                </label>
                <label className={styles.settingsRadioRow} htmlFor="settings-editor-tips-minimal">
                  <input
                    id="settings-editor-tips-minimal"
                    type="radio"
                    name="editor-tips-detail"
                    checked={editorTipsDetailLevel === "minimal"}
                    disabled={isOffline || isEditorTipsSaving}
                    onChange={() => void handleEditorTipsDetailLevelChange("minimal")}
                  />
                  <span className={styles.settingsRadioCopy}>
                    <span className={styles.settingsRadioTitle}>Mínimo</span>
                    <span className={styles.settingsRadioDescription}>
                      Sin franja de pistas ni tooltips; seguís pudiendo abrir el glosario a mano.
                    </span>
                  </span>
                </label>
              </div>
            ) : null}
            <div className={styles.settingsGlossaryAction}>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsGlossaryOpen(true)}>
                Ver glosario completo
              </Button>
            </div>
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
    <EditorGlossaryModal open={isGlossaryOpen} onOpenChange={setIsGlossaryOpen} />
    </>
  );
}
