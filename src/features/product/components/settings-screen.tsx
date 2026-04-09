"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AppBoneyardSkeleton } from "@/components/ui/boneyard-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { type SettingsViewState } from "@/features/product/view-states";
import {
  flushPreferenceOverlayToServer,
  mergeUserProfilePreferencesResilient,
  offlinePreferenceSuccessMessage,
  readPreferenceOverlay,
} from "@/features/user/local-profile-preferences-overlay";
import {
  formatProfilePlanLabel,
  resolveEditorAutosaveEnabled,
  resolveEditorTipsDetailLevel,
  resolveEditorTipsEnabled,
  type EditorTipsDetailLevel,
  type UserAppProfile,
  updateUserProfileDisplayName,
} from "@/features/user/profile";
import { createSupabaseBrowserClient, getSupabaseBrowserClientWithUser } from "@/lib/supabase/client";
import type { ThemePreference } from "@/lib/theme";

import { EditorGlossaryModal } from "./editor-glossary-modal";
import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type SettingsScreenProps = {
  viewState: SettingsViewState;
  accountEmail: string | null;
  initialProfile: UserAppProfile | null;
  passwordAuthAvailable: boolean;
  profileLoadFailed: boolean;
};

type PasswordFieldErrors = {
  confirm?: string;
  current?: string;
  next?: string;
};

function mapPasswordChangeError(message: string): string {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "La contraseña actual no es correcta.";
  }
  if (normalized.includes("password should be at least") || normalized.includes("at least 6")) {
    return "La nueva contraseña no cumple la política mínima del servicio.";
  }
  if (normalized.includes("same as")) {
    return "La nueva contraseña debe ser distinta a la actual.";
  }
  return "No se pudo actualizar la contraseña. Intenta de nuevo.";
}

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

function SettingsLoadingFixture() {
  return (
    <div className={styles.settingsLayout} aria-hidden="true">
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Perfil</h2>
          <p className={styles.sectionDescription}>
            Ajusta tu nombre visible y la información básica de tu cuenta.
          </p>
        </div>

        <div className={styles.fieldRow}>
          <div className="ui-input">Marina Rojas</div>
          <p className={styles.sectionDescription}>Se mostrará en portadas y exportaciones.</p>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Editor</h2>
          <p className={styles.sectionDescription}>
            Define ayudas, glosario y guardado automático para la escritura.
          </p>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.settingsToggleRow}>
            <div className={styles.settingsToggleCopy}>
              <p className={styles.settingsToggleTitle}>Mostrar ayudas contextuales</p>
              <p className={styles.settingsToggleDescription}>
                Pistas breves según el bloque activo y el momento del guion.
              </p>
            </div>
          </div>
          <p className={styles.sectionDescription}>Modo detallado activado.</p>
        </div>
      </section>
    </div>
  );
}

function SettingsLoadingFallback() {
  return (
    <div className={styles.settingsLayout} aria-label="Cargando ajustes">
      {Array.from({ length: 2 }).map((_, index) => (
        <section key={`settings-skeleton-${index}`} className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className="ui-skeleton" style={{ borderRadius: "999px", height: "1rem", width: "26%" }} />
            <div className="ui-skeleton" style={{ borderRadius: "999px", height: "0.85rem", width: "54%" }} />
          </div>

          <div className={styles.fieldRow}>
            <div className="ui-skeleton" style={{ borderRadius: "0.75rem", height: "3rem", width: "100%" }} />
            <div className="ui-skeleton" style={{ borderRadius: "999px", height: "0.9rem", width: "48%" }} />
          </div>
        </section>
      ))}
    </div>
  );
}

function SettingsLoadingState() {
  return (
    <AppBoneyardSkeleton
      fallback={<SettingsLoadingFallback />}
      loading={true}
      name="settings-loading-screen"
    >
      <SettingsLoadingFixture />
    </AppBoneyardSkeleton>
  );
}

export function SettingsScreen({
  viewState,
  accountEmail,
  initialProfile,
  passwordAuthAvailable,
  profileLoadFailed,
}: SettingsScreenProps) {
  const router = useRouter();
  const defaultName = defaultDisplayName(initialProfile, accountEmail);
  const [displayName, setDisplayName] = useState(defaultName);
  const [savedName, setSavedName] = useState(defaultName);
  const [nameError, setNameError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [signOutScope, setSignOutScope] = useState<"global" | "local" | null>(null);
  const [signOutError, setSignOutError] = useState<string>();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<PasswordFieldErrors>({});
  const [passwordFormError, setPasswordFormError] = useState<string>();
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
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
    const uid = initialProfile?.id;
    const baseTips = resolveEditorTipsEnabled(initialProfile?.preferences);
    const baseDetail = resolveEditorTipsDetailLevel(initialProfile?.preferences);
    const baseAutosave = resolveEditorAutosaveEnabled(initialProfile?.preferences);

    if (!uid) {
      setEditorTipsEnabled(baseTips);
      setEditorTipsDetailLevel(baseDetail);
      setEditorAutosaveEnabled(baseAutosave);
      return;
    }

    const overlay = readPreferenceOverlay(uid);
    setEditorTipsEnabled(
      typeof overlay.editorTipsEnabled === "boolean" ? overlay.editorTipsEnabled : baseTips,
    );
    setEditorTipsDetailLevel(
      overlay.editorTipsDetailLevel === "full" || overlay.editorTipsDetailLevel === "minimal"
        ? overlay.editorTipsDetailLevel
        : baseDetail,
    );
    setEditorAutosaveEnabled(
      typeof overlay.editorAutosaveEnabled === "boolean"
        ? overlay.editorAutosaveEnabled
        : baseAutosave,
    );
  }, [initialProfile]);

  useEffect(() => {
    const uid = initialProfile?.id;
    if (!uid || typeof navigator === "undefined" || !navigator.onLine) {
      return undefined;
    }

    function flushOverlay() {
      void (async () => {
        const auth = await getSupabaseBrowserClientWithUser();
        if (!auth.ok || auth.user.id !== uid) {
          return;
        }
        if (Object.keys(readPreferenceOverlay(uid)).length === 0) {
          return;
        }
        const { ok } = await flushPreferenceOverlayToServer(auth.supabase, uid);
        if (ok) {
          router.refresh();
        }
      })();
    }

    flushOverlay();
    window.addEventListener("online", flushOverlay);
    return () => {
      window.removeEventListener("online", flushOverlay);
    };
  }, [initialProfile?.id, router]);

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
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok) {
        setNameError("No hay sesión activa.");
        return;
      }

      const { error } = await updateUserProfileDisplayName(
        auth.supabase,
        auth.user.id,
        displayName.trim(),
      );

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
    if (isEditorTipsSaving) {
      return;
    }

    const uid = initialProfile?.id;
    if (!uid) {
      showToast({
        description: "No hay perfil cargado.",
        title: "Error",
        tone: "error",
      });
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok || auth.user.id !== uid) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { appliedLocallyOnly, error } = await mergeUserProfilePreferencesResilient(
        auth.supabase,
        uid,
        {
          editorTipsEnabled: nextEnabled,
        },
      );

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
        description: appliedLocallyOnly
          ? offlinePreferenceSuccessMessage()
          : nextEnabled
            ? "Verás de nuevo el glosario y las pistas según tu nivel de ayuda."
            : "El editor queda sin ayudas visibles; podés reactivarlas en Ajustes → Editor.",
        title: appliedLocallyOnly ? "Guardado en el dispositivo" : "Preferencia guardada",
        tone: "success",
      });
      if (!appliedLocallyOnly) {
        router.refresh();
      }
    } catch {
      showToast({
        description: "Algo salió mal. Intenta de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
    }
  }

  async function handleEditorTipsDetailLevelChange(nextLevel: EditorTipsDetailLevel) {
    if (isEditorTipsSaving || editorTipsDetailLevel === nextLevel) {
      return;
    }

    const uid = initialProfile?.id;
    if (!uid) {
      showToast({
        description: "No hay perfil cargado.",
        title: "Error",
        tone: "error",
      });
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok || auth.user.id !== uid) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { appliedLocallyOnly, error } = await mergeUserProfilePreferencesResilient(
        auth.supabase,
        uid,
        {
          editorTipsDetailLevel: nextLevel,
        },
      );

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
        description: appliedLocallyOnly
          ? offlinePreferenceSuccessMessage()
          : nextLevel === "full"
            ? "Verás pistas al escribir y tooltips con definiciones."
            : "Quedan el glosario manual y el lienzo más limpio, sin franja de pistas.",
        title: appliedLocallyOnly ? "Guardado en el dispositivo" : "Preferencia guardada",
        tone: "success",
      });
      if (!appliedLocallyOnly) {
        router.refresh();
      }
    } catch {
      showToast({
        description: "Algo salió mal. Intenta de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
    }
  }

  async function handleEditorAutosaveChange(nextEnabled: boolean) {
    if (isEditorTipsSaving || editorAutosaveEnabled === nextEnabled) {
      return;
    }

    const uid = initialProfile?.id;
    if (!uid) {
      showToast({
        description: "No hay perfil cargado.",
        title: "Error",
        tone: "error",
      });
      return;
    }

    setIsEditorTipsSaving(true);

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok || auth.user.id !== uid) {
        showToast({
          description: "No hay sesión activa.",
          title: "Error",
          tone: "error",
        });
        return;
      }

      const { appliedLocallyOnly, error } = await mergeUserProfilePreferencesResilient(
        auth.supabase,
        uid,
        {
          editorAutosaveEnabled: nextEnabled,
        },
      );

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
        description: appliedLocallyOnly
          ? offlinePreferenceSuccessMessage()
          : nextEnabled
            ? "El guión puede sincronizarse al pulsar Intro y al editar el título."
            : "Usá «Guardar» en el editor o confirmá al ir a Proyectos o Ajustes.",
        title: appliedLocallyOnly ? "Guardado en el dispositivo" : "Preferencia guardada",
        tone: "success",
      });
      if (!appliedLocallyOnly) {
        router.refresh();
      }
    } catch {
      showToast({
        description: "Algo salió mal. Intenta de nuevo.",
        title: "Error",
        tone: "error",
      });
    } finally {
      setIsEditorTipsSaving(false);
    }
  }

  async function persistThemePreference(next: ThemePreference) {
    const uid = initialProfile?.id;
    if (!uid) {
      return;
    }

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok || auth.user.id !== uid) {
        return;
      }

      const { appliedLocallyOnly, error } = await mergeUserProfilePreferencesResilient(
        auth.supabase,
        uid,
        {
          theme: next,
        },
      );

      if (error) {
        showToast({
          description: "No se pudo guardar el tema en tu cuenta.",
          title: "Preferencia no guardada",
          tone: "error",
        });
        return;
      }

      showToast({
        description: appliedLocallyOnly
          ? offlinePreferenceSuccessMessage()
          : "El tema quedará sincronizado entre dispositivos.",
        title: appliedLocallyOnly ? "Guardado en el dispositivo" : "Tema guardado",
        tone: "success",
      });
      if (!appliedLocallyOnly) {
        router.refresh();
      }
    } catch {
      showToast({
        description: "Algo salió mal al guardar el tema.",
        title: "Error",
        tone: "error",
      });
    }
  }

  function validatePasswordForm(): PasswordFieldErrors {
    const nextErrors: PasswordFieldErrors = {};
    if (currentPassword.trim().length === 0) {
      nextErrors.current = "Este campo es obligatorio.";
    }
    if (newPassword.trim().length === 0) {
      nextErrors.next = "Este campo es obligatorio.";
    } else if (newPassword.trim().length < 8) {
      nextErrors.next = "La contraseña debe tener al menos 8 caracteres.";
    }
    if (confirmPassword.trim().length === 0) {
      nextErrors.confirm = "Confirmá la nueva contraseña.";
    } else if (confirmPassword.trim() !== newPassword.trim()) {
      nextErrors.confirm = "Las contraseñas nuevas no coinciden.";
    }
    return nextErrors;
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordFormError(undefined);

    if (isOffline || !accountEmail) {
      setPasswordFormError(
        isOffline ? "Necesitás conexión para cambiar la contraseña." : "No hay correo en la sesión.",
      );
      return;
    }

    const fieldErrors = validatePasswordForm();
    if (Object.keys(fieldErrors).length > 0) {
      setPasswordFieldErrors(fieldErrors);
      return;
    }
    setPasswordFieldErrors({});

    setIsPasswordSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: currentPassword.trim(),
      });

      if (signError) {
        setPasswordFormError(mapPasswordChangeError(signError.message));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (updateError) {
        setPasswordFormError(mapPasswordChangeError(updateError.message));
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({
        description: "Tu contraseña se actualizó correctamente.",
        title: "Contraseña actualizada",
        tone: "success",
      });
    } catch {
      setPasswordFormError("Algo salió mal. Revisa tu conexión.");
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handleSignOut(scope: "global" | "local") {
    setSignOutError(undefined);
    setSignOutScope(scope);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut({ scope });

      if (error) {
        setSignOutError("No se pudo cerrar sesión. Intenta de nuevo.");
        return;
      }

      router.replace(routes.login);
      router.refresh();
    } catch {
      setSignOutError("No se pudo cerrar sesión. Revisa tu configuración de Supabase.");
    } finally {
      setSignOutScope(null);
    }
  }

  const planLabel = initialProfile ? formatProfilePlanLabel(initialProfile.plan) : "—";
  const memberSinceLabel = initialProfile ? formatCreatedAtLabel(initialProfile.createdAt) : "—";
  const isSigningOut = signOutScope !== null;

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
                El tema oscuro es el predeterminado. Cambiá a claro cuando te resulte más cómodo. Se guarda
                en tu cuenta para mantener la misma elección en cada dispositivo.
              </p>
            </header>
            <div className={styles.appearanceRow}>
              <span className={styles.readonlyLabel}>Tema de la interfaz</span>
              <ThemeToggle
                onAfterThemeChange={(next) => {
                  void persistThemePreference(next);
                }}
              />
            </div>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Seguridad</h2>
              <p className={styles.sectionDescription}>
                Cambiá la contraseña de acceso con correo y contraseña. Si no la recordás, pedí un enlace
                de recuperación.
              </p>
            </header>

            {passwordAuthAvailable && accountEmail ? (
              <form className={styles.fieldRow} onSubmit={handlePasswordSubmit} noValidate>
                <Input
                  name="currentPassword"
                  autoComplete="current-password"
                  label="Contraseña actual"
                  type="password"
                  value={currentPassword}
                  error={passwordFieldErrors.current}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordFieldErrors((current) => ({ ...current, current: undefined }));
                    setPasswordFormError(undefined);
                  }}
                  disabled={isOffline || isPasswordSaving}
                  required
                  requiredLabel="Obligatorio"
                />
                <Input
                  name="newPassword"
                  autoComplete="new-password"
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  error={passwordFieldErrors.next}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordFieldErrors((current) => ({ ...current, next: undefined }));
                    setPasswordFormError(undefined);
                  }}
                  disabled={isOffline || isPasswordSaving}
                  required
                  requiredLabel="Obligatorio"
                />
                <Input
                  name="confirmPassword"
                  autoComplete="new-password"
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  error={passwordFieldErrors.confirm}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordFieldErrors((current) => ({ ...current, confirm: undefined }));
                    setPasswordFormError(undefined);
                  }}
                  disabled={isOffline || isPasswordSaving}
                  required
                  requiredLabel="Obligatorio"
                />
                {passwordFormError ? (
                  <p className={styles.inlineNotice} role="alert">
                    {passwordFormError}
                  </p>
                ) : null}
                <div className={styles.fieldInline}>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isOffline || isPasswordSaving}
                  >
                    {isPasswordSaving ? "Guardando..." : "Actualizar contraseña"}
                  </Button>
                  <Link
                    href={routes.forgotPassword}
                    className="ui-button"
                    data-size="md"
                    data-variant="ghost"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>
              </form>
            ) : (
              <p className={styles.sectionNote}>
                Tu sesión no usa contraseña de Scriptum (por ejemplo, solo otro proveedor). Para ajustar
                el acceso, cerrá sesión y volvé a entrar con el método que suelas usar.
              </p>
            )}
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

            <p className={styles.sectionNote}>
              «Cerrar sesión» deja este navegador. «Todos los dispositivos» también invalida las demás
              sesiones abiertas.
            </p>

            {signOutError ? <p className={styles.inlineNotice}>{signOutError}</p> : null}

            <div className={styles.sectionFooter}>
              <Button
                type="button"
                variant="danger"
                size="md"
                disabled={isSigningOut}
                onClick={() => void handleSignOut("local")}
              >
                {signOutScope === "local" ? "Cerrando..." : "Cerrar sesión"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isSigningOut}
                onClick={() => void handleSignOut("global")}
              >
                {signOutScope === "global" ? "Cerrando..." : "Cerrar en todos los dispositivos"}
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
