"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import {
  getPreviewLines,
  getPreviewProject,
  getPreviewScenes,
  previewUser,
} from "@/features/product/preview-data";
import { type EditorViewState, type ExportViewState } from "@/features/product/view-states";
import { cn } from "@/lib/cn";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type EditorScreenProps = {
  initialExportState: ExportViewState;
  projectId: string;
  viewState: EditorViewState;
};

type LocalExportState = Exclude<ExportViewState, "closed">;
type SaveTone = "danger" | "muted" | "success" | "warning";

type StatusPresentation = {
  label: string;
  tone: SaveTone;
};

function getStatusClassName(tone: SaveTone): string {
  switch (tone) {
    case "danger":
      return styles.editorStatusDanger;
    case "success":
      return styles.editorStatusSuccess;
    case "warning":
      return styles.editorStatusWarning;
    default:
      return styles.editorStatusMuted;
  }
}

function getStatusPresentation({
  highlightSaved,
  saveState,
  viewState,
}: {
  highlightSaved: boolean;
  saveState: "saving" | "synced";
  viewState: EditorViewState;
}): StatusPresentation {
  if (viewState === "offline") {
    return {
      label: "Sin conexión",
      tone: "warning",
    };
  }

  if (viewState === "save-error") {
    return {
      label: "Error al guardar",
      tone: "danger",
    };
  }

  if (viewState === "unsaved") {
    return {
      label: "Sin guardar",
      tone: "warning",
    };
  }

  if (viewState === "syncing") {
    return {
      label: "Sincronizando...",
      tone: "muted",
    };
  }

  if (viewState === "saving") {
    return {
      label: "Guardando...",
      tone: "muted",
    };
  }

  if (saveState === "saving") {
    return {
      label: "Guardando...",
      tone: "muted",
    };
  }

  return {
    label: "Guardado",
    tone: highlightSaved ? "success" : "muted",
  };
}

function EditorLoadingScreen({ title }: { title: string }) {
  return (
    <div className={styles.editorShell}>
      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderStart}>
          <Link href={routes.projects} className={styles.editorBreadcrumb}>
            SCRIPTUM
          </Link>
          <Skeleton height="1.2rem" width="12rem" radius="999px" />
        </div>

        <div className={styles.editorHeaderCenter}>
          <span className={cn(styles.editorStatus, styles.editorStatusMuted)}>Cargando...</span>
        </div>

        <div className={styles.editorHeaderEnd}>
          <ThemeToggle />
          <Skeleton height="2.5rem" width="7rem" radius="0.75rem" />
        </div>
      </header>

      <div className={styles.editorWorkspace}>
        <aside className={styles.editorSidebar}>
          <div className={styles.editorSidebarHeader}>
            <p className={styles.editorSidebarTitle}>Escenas</p>
          </div>

          <div className={styles.skeletonList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`scene-skeleton-${index}`} className={styles.skeletonRowMain}>
                <Skeleton height="0.85rem" width="34%" radius="999px" />
                <Skeleton height="1.05rem" width="88%" radius="0.75rem" />
              </div>
            ))}
          </div>
        </aside>

        <main className={styles.editorCanvas}>
          <div className={styles.editorCanvasStage}>
            <div className={cn(styles.editorPaper, styles.editorPaperLoading)}>
              <div className={styles.skeletonList}>
                <Skeleton height="0.95rem" width="26%" radius="999px" />
                <Skeleton height="0.95rem" width="92%" radius="999px" />
                <Skeleton height="0.95rem" width="84%" radius="999px" />
                <Skeleton height="0.95rem" width="36%" radius="999px" />
              </div>
              <p className={styles.editorLoadingCopy}>Cargando...</p>
            </div>
          </div>
        </main>
      </div>

      <footer className={styles.editorFooter}>
        <div className={styles.editorFooterMeta}>
          <span>Documento</span>
          <span>{title}</span>
        </div>
        <div className={styles.editorFooterMeta}>
          <span>Esperando snapshot</span>
        </div>
      </footer>
    </div>
  );
}

export function EditorScreen({ initialExportState, projectId, viewState }: EditorScreenProps) {
  const project = getPreviewProject(projectId);
  const previewScenes = viewState === "empty" ? [] : getPreviewScenes(project.blocks);
  const previewLines = viewState === "empty" ? [] : getPreviewLines(project.blocks);
  const { showToast } = useToast();
  const saveTimeoutRef = useRef<number | null>(null);
  const saveFadeTimeoutRef = useRef<number | null>(null);
  const exportTimeoutRef = useRef<number | null>(null);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [saveState, setSaveState] = useState<"saving" | "synced">(
    viewState === "saving" ? "saving" : "synced",
  );
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(previewScenes[0]?.id ?? null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(initialExportState !== "closed");
  const [exportState, setExportState] = useState<LocalExportState>(
    initialExportState === "closed" ? "ready" : initialExportState,
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      if (saveFadeTimeoutRef.current) {
        window.clearTimeout(saveFadeTimeoutRef.current);
      }

      if (exportTimeoutRef.current) {
        window.clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (viewState === "syncing") {
      showToast({
        description: "Sincronizando cambios pendientes.",
        title: "Conexión restaurada",
        tone: "success",
      });
    }
  }, [viewState, showToast]);

  if (viewState === "error") {
    return (
      <StatePanel
        title="Algo salió mal"
        description="No pudimos cargar este proyecto."
        secondaryDescription="Intenta recargar o vuelve al inicio."
        tone="danger"
        actions={
          <>
            <Link
              href={routes.projectEditor(projectId)}
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

  if (viewState === "loading") {
    return <EditorLoadingScreen title={project.title} />;
  }

  const status = getStatusPresentation({
    highlightSaved,
    saveState,
    viewState,
  });
  const isOffline = viewState === "offline";
  const resolvedSceneId = previewScenes.some((scene) => scene.id === activeSceneId)
    ? activeSceneId
    : (previewScenes[0]?.id ?? null);
  const activeScene =
    previewScenes.find((scene) => scene.id === resolvedSceneId) ?? previewScenes[0] ?? null;
  const visibleBlockType =
    viewState === "empty" ? "Action" : activeScene ? "Scene Heading" : "Action";

  function queueSaveConfirmation() {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    if (saveFadeTimeoutRef.current) {
      window.clearTimeout(saveFadeTimeoutRef.current);
    }

    setSaveState("saving");
    setHighlightSaved(false);

    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveState("synced");
      setHighlightSaved(true);

      saveFadeTimeoutRef.current = window.setTimeout(() => {
        setHighlightSaved(false);
      }, 2000);
    }, 900);
  }

  function handleTitleChange(nextTitle: string) {
    setProjectTitle(nextTitle);

    if (viewState !== "default" && viewState !== "synced") {
      return;
    }

    queueSaveConfirmation();
  }

  function handleOpenExportModal() {
    if (isOffline) {
      return;
    }

    setIsExportModalOpen(true);
    setExportState("ready");
  }

  function handleCancelExport() {
    if (exportState === "exporting") {
      if (exportTimeoutRef.current) {
        window.clearTimeout(exportTimeoutRef.current);
      }

      setExportState("ready");
      return;
    }

    setIsExportModalOpen(false);
  }

  function handleExport() {
    if (isOffline) {
      return;
    }

    setExportState("exporting");
    exportTimeoutRef.current = window.setTimeout(() => {
      setExportState("success");
      showToast({
        description: "La descarga queda lista desde el modal de exportación.",
        title: "PDF listo",
        tone: "success",
      });
    }, 1200);
  }

  function handleRetryExport() {
    setExportState("ready");
  }

  function handleDownloadExport() {
    showToast({
      description: "El PDF queda listo para guardarse localmente.",
      title: "Descarga iniciada",
      tone: "success",
    });
    setIsExportModalOpen(false);
  }

  return (
    <div className={styles.editorShell}>
      {isOffline ? (
        <div className={styles.inlineNotice}>
          Sin conexión. Cambios en local; la sincronización espera red.
        </div>
      ) : null}

      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderStart}>
          <Link href={routes.projects} className={styles.editorBreadcrumb}>
            SCRIPTUM
          </Link>
          <input
            type="text"
            className={styles.editorTitleInput}
            aria-label="Título del proyecto"
            value={projectTitle}
            onChange={(event) => handleTitleChange(event.target.value)}
          />
        </div>

        <div className={styles.editorHeaderCenter}>
          <span className={cn(styles.editorStatus, getStatusClassName(status.tone))}>
            {status.label}
          </span>
        </div>

        <div className={styles.editorHeaderEnd}>
          <ThemeToggle />
          <Button variant="ghost" onClick={() => setIsSidebarVisible((current) => !current)}>
            {isSidebarVisible ? "Ocultar escenas" : "Ver escenas"}
          </Button>
          <Button variant="secondary" onClick={handleOpenExportModal} disabled={isOffline}>
            Exportar
          </Button>
          <Link href={routes.settings} className={styles.editorBreadcrumb}>
            Ajustes
          </Link>
        </div>
      </header>

      <div className={styles.editorWorkspace}>
        <aside
          className={cn(styles.editorSidebar, !isSidebarVisible && styles.editorSidebarHidden)}
          aria-label="Sidebar de escenas"
        >
          <div className={styles.editorSidebarHeader}>
            <p className={styles.editorSidebarTitle}>Escenas</p>
            <button
              type="button"
              className={styles.editorSidebarToggle}
              onClick={() => setIsSidebarVisible(false)}
            >
              Cerrar
            </button>
          </div>

          {previewScenes.length === 0 ? (
            <div className={styles.sceneEmpty}>
              <div>
                <div>Sin escenas todavía</div>
                <div>Escribe un encabezado de escena para empezar.</div>
              </div>
            </div>
          ) : (
            <ol className={styles.sceneList}>
              {previewScenes.map((scene) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    className={cn(
                      styles.sceneButton,
                      resolvedSceneId === scene.id && styles.sceneButtonActive,
                    )}
                    onClick={() => setActiveSceneId(scene.id)}
                  >
                    <span className={styles.sceneIndex}>{scene.indexLabel}</span>
                    <span className={styles.sceneHeading}>{scene.heading}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <main className={styles.editorCanvas}>
          <div className={styles.editorCanvasStage}>
            <article className={styles.editorPaper}>
              {viewState === "empty" ? (
                <div className={styles.blankActionLine} aria-label="Bloque Action vacío">
                  <span className={styles.blankCaret} aria-hidden="true" />
                </div>
              ) : (
                previewLines.map((line) => (
                  <p
                    key={line.id}
                    className={cn(
                      styles.editorLine,
                      line.type === "scene-heading" && styles.editorLineSceneHeading,
                      line.type === "character" && styles.editorLineCharacter,
                      line.type === "dialogue" && styles.editorLineDialogue,
                      line.type === "parenthetical" && styles.editorLineParenthetical,
                      line.type === "transition" && styles.editorLineTransition,
                    )}
                  >
                    {line.text}
                  </p>
                ))
              )}
            </article>
          </div>
        </main>
      </div>

      <footer className={styles.editorFooter}>
        <div className={styles.editorFooterMeta}>
          <span>{visibleBlockType}</span>
          <span>~{project.estimatedPages} páginas</span>
        </div>
        <div className={styles.editorFooterMeta}>
          <span>{previewScenes.length} escenas</span>
          <span>{activeScene ? activeScene.indexLabel : "Sin escenas"}</span>
        </div>
      </footer>

      <Modal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exportar guion"
        closeLabel="Cerrar modal"
        footer={
          exportState === "success" ? (
            <>
              <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
                Cerrar
              </Button>
              <Button variant="success" onClick={handleDownloadExport}>
                Descargar PDF
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleCancelExport}>
                Cancelar
              </Button>
              {exportState === "error" ? (
                <Button onClick={handleRetryExport}>Reintentar</Button>
              ) : (
                <Button
                  onClick={handleExport}
                  disabled={isOffline || exportState === "exporting"}
                  variant="primary"
                >
                  {exportState === "exporting" ? "Exportando..." : "Exportar PDF"}
                </Button>
              )}
            </>
          )
        }
      >
        <div className={styles.modalSection}>
          {exportState === "success" ? (
            <>
              <p className={cn(styles.modalMessage, styles.modalMessageSuccess)}>
                Tu PDF está listo.
              </p>
              <p className={styles.modalHint}>
                Si la descarga no se inició sola, usa el botón para bajarla.
              </p>
            </>
          ) : (
            <>
              <div className={styles.modalSummary}>
                <div className={styles.modalSummaryRow}>
                  <span>Título</span>
                  <strong>{projectTitle.trim() || "Sin título"}</strong>
                </div>
                <div className={styles.modalSummaryRow}>
                  <span>Autor</span>
                  <strong>{project.author ?? previewUser.name ?? "Sin definir"}</strong>
                </div>
                <div className={styles.modalSummaryRow}>
                  <span>Escenas</span>
                  <strong>{previewScenes.length}</strong>
                </div>
                <div className={styles.modalSummaryRow}>
                  <span>Páginas</span>
                  <strong>~{project.estimatedPages}</strong>
                </div>
              </div>

              {exportState === "error" ? (
                <p className={cn(styles.modalMessage, styles.modalMessageError)}>
                  No se pudo generar el PDF. Intenta de nuevo.
                </p>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
