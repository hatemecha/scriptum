"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

import { $getNodeByKey, type EditorState, type LexicalEditor } from "lexical";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { SET_BLOCK_TYPE_COMMAND } from "@/features/editor/commands";
import { ScreenplayEditor } from "@/features/editor/components/ScreenplayEditor";
import {
  deriveActiveSceneKey,
  deriveSceneNavigators,
  estimatePagesFromEditorState,
  type DerivedSceneNav,
} from "@/features/editor/editor-derived-state";
import { $isScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";
import { isScreenplayBlockType, screenplayBlockTypes, type ScreenplayBlockType } from "@/features/screenplay/blocks";
import {
  getPreviewLines,
  getPreviewProject,
  previewUser,
} from "@/features/product/preview-data";
import { type EditorViewState, type ExportViewState } from "@/features/product/view-states";
import { cn } from "@/lib/cn";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

const BLOCK_TYPE_LABEL_ES: Record<ScreenplayBlockType, string> = {
  "scene-heading": "Encabezado",
  action: "Acción",
  character: "Personaje",
  dialogue: "Diálogo",
  parenthetical: "Paréntesis",
  transition: "Transición",
};
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
        <div className={styles.editorHeaderLeading}>
          <Link href={routes.projects} className={styles.editorBack}>
            ← Proyectos
          </Link>
          <div className={styles.editorTitleCluster}>
            <Skeleton height="1.35rem" width="min(14rem, 42vw)" radius="0.5rem" />
            <span className={cn(styles.editorStatus, styles.editorStatusMuted)}>Cargando…</span>
          </div>
        </div>

        <div className={styles.editorHeaderActions}>
          <Skeleton height="2.25rem" width="2.25rem" radius="0.65rem" />
          <Skeleton height="2.25rem" width="4.5rem" radius="0.65rem" />
          <Skeleton height="2.25rem" width="2.25rem" radius="0.65rem" />
          <Skeleton height="2.25rem" width="5.5rem" radius="0.75rem" />
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
  const previewLines = viewState === "empty" ? [] : getPreviewLines(project.blocks);
  const { showToast } = useToast();
  const saveTimeoutRef = useRef<number | null>(null);
  const saveFadeTimeoutRef = useRef<number | null>(null);
  const exportTimeoutRef = useRef<number | null>(null);
  const lexicalEditorRef = useRef<LexicalEditor | null>(null);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [saveState, setSaveState] = useState<"saving" | "synced">(
    viewState === "saving" ? "saving" : "synced",
  );
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [editorScenes, setEditorScenes] = useState<DerivedSceneNav[]>([]);
  const [activeSceneKey, setActiveSceneKey] = useState<string | null>(null);
  const [estimatedPages, setEstimatedPages] = useState(project.estimatedPages);
  const [isExportModalOpen, setIsExportModalOpen] = useState(initialExportState !== "closed");
  const [exportState, setExportState] = useState<LocalExportState>(
    initialExportState === "closed" ? "ready" : initialExportState,
  );
  const [activeBlockType, setActiveBlockType] = useState<ScreenplayBlockType>("action");

  const handleBlockTypeChange = useCallback(
    (blockType: ScreenplayBlockType) => {
      setActiveBlockType(blockType);
    },
    [],
  );

  const syncFromEditorState = useCallback((editorState: EditorState) => {
    setEditorScenes(deriveSceneNavigators(editorState));
    setActiveSceneKey(deriveActiveSceneKey(editorState));
    setEstimatedPages(estimatePagesFromEditorState(editorState));
  }, []);

  const handleEditorReady = useCallback(
    (editor: LexicalEditor) => {
      lexicalEditorRef.current = editor;
      syncFromEditorState(editor.getEditorState());
    },
    [syncFromEditorState],
  );

  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      lexicalEditorRef.current = editor;
      syncFromEditorState(editorState);
    },
    [syncFromEditorState],
  );

  const handleBlockTypeSelect = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!isScreenplayBlockType(value)) return;
    const editor = lexicalEditorRef.current;
    if (!editor) return;
    editor.dispatchCommand(SET_BLOCK_TYPE_COMMAND, { blockType: value });
    setActiveBlockType(value);
  }, []);

  const handleSceneNavigate = useCallback((sceneKey: string) => {
    setActiveSceneKey(sceneKey);
    const editor = lexicalEditorRef.current;
    if (!editor) return;
    editor.update(() => {
      const node = $getNodeByKey(sceneKey);
      if (node && $isScreenplayBlockNode(node)) {
        node.selectEnd();
      }
    });
    queueMicrotask(() => {
      const el = editor.getElementByKey(sceneKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

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
  const activeEditorScene =
    editorScenes.find((scene) => scene.id === activeSceneKey) ?? null;

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
        <div className={styles.editorHeaderLeading}>
          <Link href={routes.projects} className={styles.editorBack}>
            ← Proyectos
          </Link>
          <div className={styles.editorTitleCluster}>
            <input
              type="text"
              className={styles.editorTitleInput}
              aria-label="Título del proyecto"
              value={projectTitle}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
            <span
              className={cn(styles.editorStatus, getStatusClassName(status.tone))}
              role="status"
              aria-live="polite"
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className={styles.editorHeaderBlockWrap}>
          <label className={styles.visuallyHidden} htmlFor="editor-block-type">
            Tipo de bloque del guion
          </label>
          <select
            id="editor-block-type"
            className={styles.editorBlockTypeSelect}
            value={activeBlockType}
            onChange={handleBlockTypeSelect}
          >
            {screenplayBlockTypes.map((type) => (
              <option key={type} value={type}>
                {BLOCK_TYPE_LABEL_ES[type]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.editorHeaderActions}>
          <button
            type="button"
            className={styles.editorIconButton}
            onClick={() => setIsSidebarVisible((current) => !current)}
            aria-label={isSidebarVisible ? "Ocultar lista de escenas" : "Mostrar lista de escenas"}
            aria-pressed={isSidebarVisible}
          >
            <svg
              className={styles.editorScenesIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden={true}
            >
              <path
                fill="currentColor"
                d="M4 5h16v2H4V5zm0 6h10v2H4v-2zm0 6h16v2H4v-2z"
              />
            </svg>
          </button>
          <Link href={routes.settings} className={styles.editorHeaderQuiet}>
            Ajustes
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenExportModal}
            disabled={isOffline}
          >
            Exportar
          </Button>
        </div>
      </header>

      <div
        className={cn(
          styles.editorWorkspace,
          !isSidebarVisible && styles.editorWorkspaceSolo,
        )}
      >
        <aside
          className={cn(styles.editorSidebar, !isSidebarVisible && styles.editorSidebarHidden)}
          aria-label="Sidebar de escenas"
        >
          <div className={styles.editorSidebarHeader}>
            <p className={styles.editorSidebarTitle}>
              Escenas
              <span className={styles.editorSceneCount}> · {editorScenes.length}</span>
            </p>
            <button
              type="button"
              className={styles.editorSidebarToggle}
              onClick={() => setIsSidebarVisible(false)}
            >
              Cerrar
            </button>
          </div>

          {editorScenes.length === 0 ? (
            <div className={styles.sceneEmpty}>
              <div>
                <div>Sin escenas todavía</div>
                <div>Añade un bloque Encabezado (o Tab hasta Encabezado) y escribe INT./EXT.</div>
              </div>
            </div>
          ) : (
            <ol className={styles.sceneList}>
              {editorScenes.map((scene) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    className={cn(
                      styles.sceneButton,
                      activeSceneKey === scene.id && styles.sceneButtonActive,
                    )}
                    onClick={() => handleSceneNavigate(scene.id)}
                  >
                    <span className={styles.sceneIndex}>{scene.indexLabel}</span>
                    <span className={styles.sceneHeading}>{scene.heading}</span>
                    {scene.snippet ? (
                      <span className={styles.sceneSnippet}>{scene.snippet}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <main className={styles.editorCanvas}>
          <div className={styles.editorCanvasStage}>
            <article className={styles.editorPaper}>
              <ScreenplayEditor
                initialBlocks={
                  viewState === "empty"
                    ? []
                    : previewLines.map((line) => ({
                        id: line.id,
                        text: line.text,
                        type: line.type,
                      }))
                }
                onEditorReady={handleEditorReady}
                onChange={handleEditorChange}
                onBlockTypeChange={handleBlockTypeChange}
                placeholder="Empieza a escribir tu guión..."
              />
            </article>
          </div>
        </main>
      </div>

      <footer className={styles.editorFooter}>
        <div className={styles.editorFooterMeta}>
          <span>{BLOCK_TYPE_LABEL_ES[activeBlockType]}</span>
          <span>~{estimatedPages} páginas</span>
        </div>
        <div className={styles.editorFooterMeta}>
          <span>{editorScenes.length} escenas</span>
          <span>{activeEditorScene ? activeEditorScene.indexLabel : "Sin escena activa"}</span>
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
                  <strong>{editorScenes.length}</strong>
                </div>
                <div className={styles.modalSummaryRow}>
                  <span>Páginas</span>
                  <strong>~{estimatedPages}</strong>
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
