"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { previewUser } from "@/features/product/preview-data";
import { type SettingsViewState } from "@/features/product/view-states";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type SettingsScreenProps = {
  viewState: SettingsViewState;
};

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

export function SettingsScreen({ viewState }: SettingsScreenProps) {
  const saveTimeoutRef = useRef<number | null>(null);
  const [displayName, setDisplayName] = useState(previewUser.name);
  const [savedName, setSavedName] = useState(previewUser.name);
  const [nameError, setNameError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (viewState === "error") {
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

  const isOffline = viewState === "offline";
  const isForcedSaving = viewState === "saving";
  const canSave = displayName.trim().length > 0 && displayName.trim() !== savedName && !isOffline;
  const pending = isSaving || isForcedSaving;

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
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
    saveTimeoutRef.current = window.setTimeout(() => {
      const trimmedName = displayName.trim();

      setSavedName(trimmedName);
      setDisplayName(trimmedName);
      setIsSaving(false);
      showToast({
        description: "El nombre se actualizó correctamente.",
        title: "Guardado",
        tone: "success",
      });
    }, 1000);
  }

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
                <span className={styles.readonlyValue}>{previewUser.email}</span>
              </div>
            </form>
          </section>

          <section className={styles.sectionCard}>
            <header className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Cuenta</h2>
              <p className={styles.sectionDescription}>
                Plan y acceso a la cuenta.
              </p>
            </header>

            <div className={styles.readonlyCard}>
              <span className={styles.readonlyLabel}>Plan</span>
              <span className={styles.readonlyValue}>{previewUser.plan}</span>
            </div>

            <p className={styles.sectionNote}>
              Para cambiar la contraseña, usa recuperación de acceso.
            </p>

            <div className={styles.sectionFooter}>
              <Link href={routes.home} className="ui-button" data-size="md" data-variant="danger">
                Cerrar sesión
              </Link>
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
