"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { $getNodeByKey, type EditorState, type LexicalEditor } from "lexical";

import { Button } from "@/components/ui/button";
import { HoverDelayTip } from "@/components/ui/hover-delay-tip";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { SET_BLOCK_TYPE_COMMAND } from "@/features/editor/commands";
import { ScreenplayEditor } from "@/features/editor/components/ScreenplayEditor";
import {
  deriveActiveBlockContext,
  deriveActiveSceneKey,
  deriveSceneNavigators,
  estimatePagesFromEditorState,
  serializeScreenplayBlocks,
  type DerivedSceneNav,
  type SerializedBlock,
} from "@/features/editor/editor-derived-state";
import { useSceneScrollSpy } from "@/features/editor/hooks/use-scene-scroll-spy";
import { $isScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";
import { isScreenplayBlockType, screenplayBlockTypes, type ScreenplayBlockType } from "@/features/screenplay/blocks";
import { resolveScreenplayContextHint } from "@/features/screenplay/editor-help/context-hints";
import {
  getGlossaryEntryById,
  getGlossaryEntryForBlockType,
  type ScreenplayGlossaryEntry,
} from "@/features/screenplay/editor-help/glossary";
import { getSceneHeadingAutoDetectReason } from "@/features/screenplay/editor-help/scene-heading-detect";
import { getTransitionAutoDetectReason } from "@/features/screenplay/editor-help/transition-detect";
import { estimateScreenplayPageCount } from "@/features/screenplay/page-estimate";
import { clearStoredEditorDraft, readStoredEditorDraft, writeStoredEditorDraft } from "@/features/product/editor-draft";
import {
  getPreviewLines,
  getPreviewProject,
  previewUser,
} from "@/features/product/preview-data";
import { type EditorViewState } from "@/features/product/view-states";
import { mapPersistErrorForDisplay } from "@/features/projects/persist-user-messages";
import { saveProjectSnapshot, type PersistedProjectEditorData, type SerializedEditorBlock } from "@/features/projects/project-snapshots";
import {
  mergeUserProfilePreferences,
  type EditorTipsDetailLevel,
} from "@/features/user/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

import { EditorGlossaryModal } from "./editor-glossary-modal";
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
  editorAutosaveEnabled: boolean;
  editorTipsDetailLevel: EditorTipsDetailLevel;
  editorTipsEnabled: boolean;
  initialData: PersistedProjectEditorData | null;
  projectId: string;
  prototypeMode: boolean;
  viewState: EditorViewState;
};

type SaveTone = "danger" | "muted" | "success" | "warning";
type PrototypeSaveState = "saving" | "synced";
type PersistState = "error" | "local-draft" | "saved" | "saving";

type StatusPresentation = {
  label: string;
  tone: SaveTone;
};

type ScreenplayEditorSeedBlock = {
  id: string;
  text: string;
  type: ScreenplayBlockType;
};

type EditorSeed = {
  author: string | null;
  blocks: readonly SerializedEditorBlock[];
  title: string;
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

function normalizeEditableProjectTitle(value: string): string {
  const normalizedValue = value.replace(/\s+/g, " ").trim();
  return normalizedValue.length > 0 ? normalizedValue : "Sin título";
}

function createPersistSignature(title: string, blocks: readonly SerializedEditorBlock[]): string {
  return JSON.stringify({ blocks, title });
}

function toScreenplayEditorSeedBlocks(
  blocks: readonly SerializedEditorBlock[],
): ScreenplayEditorSeedBlock[] {
  return blocks.map((block, index) => ({
    id: `seed-${index}`,
    text: block.text,
    type: block.type,
  }));
}

function buildEditorSeed(
  projectId: string,
  prototypeMode: boolean,
  viewState: EditorViewState,
  initialData: PersistedProjectEditorData | null,
): EditorSeed {
  if (prototypeMode) {
    const previewProject = getPreviewProject(projectId);
    const previewBlocks =
      viewState === "empty"
        ? []
        : getPreviewLines(previewProject.blocks).map(({ text, type }) => ({
            text,
            type,
          }));

    return {
      author: previewProject.author ?? previewUser.name,
      blocks: previewBlocks,
      title: previewProject.title,
    };
  }

  if (initialData) {
    return {
      author: initialData.project.author,
      blocks: initialData.blocks,
      title: initialData.project.title,
    };
  }

  return {
    author: null,
    blocks: [],
    title: "Sin título",
  };
}

function getStatusPresentation({
  hasUnsavedChanges,
  highlightSaved,
  isOffline,
  persistState,
  prototypeMode,
  prototypeSaveState,
  viewState,
}: {
  hasUnsavedChanges: boolean;
  highlightSaved: boolean;
  isOffline: boolean;
  persistState: PersistState;
  prototypeMode: boolean;
  prototypeSaveState: PrototypeSaveState;
  viewState: EditorViewState;
}): StatusPresentation {
  if (prototypeMode) {
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

    if (viewState === "saving" || prototypeSaveState === "saving") {
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

  if (isOffline) {
    return {
      label: "Guardado en local",
      tone: "warning",
    };
  }

  if (persistState === "error") {
    return {
      label: "Cambios en local",
      tone: "danger",
    };
  }

  if (persistState === "local-draft") {
    return {
      label: "Cambios en local",
      tone: "warning",
    };
  }

  if (persistState === "saving") {
    return {
      label: "Guardando...",
      tone: "muted",
    };
  }

  if (hasUnsavedChanges) {
    return {
      label: "Sin guardar",
      tone: "warning",
    };
  }

  return {
    label: "Guardado",
    tone: highlightSaved ? "success" : "muted",
  };
}

function GlossaryTooltipBody({ entry }: { entry: ScreenplayGlossaryEntry }) {
  return (
    <>
      <strong>{entry.term}</strong>
      <p>{entry.definition}</p>
    </>
  );
}

function ScenesPanelTooltipBody() {
  const scene = getGlossaryEntryById("scene");
  if (!scene) {
    return null;
  }

  return (
    <>
      <strong>Panel de escenas</strong>
      <p>{scene.definition}</p>
      <p>Elegí una fila para ir al encabezado correspondiente en el guion.</p>
    </>
  );
}

function ScenesToggleTooltipBody() {
  const scene = getGlossaryEntryById("scene");
  if (!scene) {
    return null;
  }

  return (
    <>
      <strong>Lista de escenas</strong>
      <p>{scene.definition}</p>
      <p>Mostrá u ocultá el panel para saltar entre encabezados.</p>
    </>
  );
}

function EditorLoadingScreen({ title }: { title: string }) {
  return (
    <div className={styles.editorShell}>
      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderTop}>
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
        </div>
      </header>

      <div
        className={cn(
          styles.editorWorkspace,
          "foundation-editor-grid foundation-editor-grid--nav-first",
        )}
      >
        <aside className={styles.editorSidebar}>
          <div className={styles.editorSidebarHeader}>
            <p className="foundation-kicker">Escenas</p>
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

export function EditorScreen({
  editorAutosaveEnabled: initialEditorAutosaveEnabled,
  editorTipsDetailLevel: initialEditorTipsDetailLevel,
  editorTipsEnabled: initialEditorTipsEnabled,
  initialData,
  projectId,
  prototypeMode,
  viewState,
}: EditorScreenProps) {
  const [initialSeed] = useState(() =>
    buildEditorSeed(projectId, prototypeMode, viewState, initialData),
  );
  const initialProjectRecord = initialData?.project ?? null;
  const initialTitle = initialSeed.title;
  const initialSignature = createPersistSignature(
    normalizeEditableProjectTitle(initialTitle),
    initialSeed.blocks,
  );
  const router = useRouter();

  const autosaveTimeoutRef = useRef<number | null>(null);
  const highlightFadeTimeoutRef = useRef<number | null>(null);
  const lexicalEditorRef = useRef<LexicalEditor | null>(null);
  const editorCanvasRef = useRef<HTMLElement | null>(null);
  const editorFocusRootRef = useRef<HTMLElement | null>(null);
  const activeSceneNavButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevBlocksForFormatHintRef = useRef<readonly SerializedBlock[] | null>(null);
  const contextHintDebounceRef = useRef<number | null>(null);
  const persistLatestDraftRef = useRef<() => Promise<boolean>>(async () => true);
  const projectRecordRef = useRef(initialProjectRecord);
  const documentIdRef = useRef(initialData?.documentId ?? null);
  const editorBlocksRef = useRef<readonly SerializedEditorBlock[]>(initialSeed.blocks);
  const projectTitleRef = useRef(initialTitle);
  const isOfflineRef = useRef(false);
  const isSavingRef = useRef(false);
  const queuedPersistRef = useRef(false);
  const lastPersistedSignatureRef = useRef(initialSignature);
  const restoredLocalDraftRef = useRef(false);
  const savingIndicatorDelayRef = useRef<number | null>(null);
  const titlePersistTimeoutRef = useRef<number | null>(null);

  const [prototypeSaveState, setPrototypeSaveState] = useState<PrototypeSaveState>(
    viewState === "saving" ? "saving" : "synced",
  );
  const [persistState, setPersistState] = useState<PersistState>(prototypeMode ? "saved" : "saved");
  const [persistErrorMessage, setPersistErrorMessage] = useState<string | null>(null);
  const [isBrowserOffline, setIsBrowserOffline] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [editorScenes, setEditorScenes] = useState<DerivedSceneNav[]>([]);
  const [caretActiveSceneKey, setCaretActiveSceneKey] = useState<string | null>(null);
  const [mountedEditor, setMountedEditor] = useState<LexicalEditor | null>(null);
  const [editorWritingFocused, setEditorWritingFocused] = useState(false);
  const [estimatedPages, setEstimatedPages] = useState(
    estimateScreenplayPageCount(initialSeed.blocks),
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editorAutosaveEnabled] = useState(initialEditorAutosaveEnabled);
  const [leaveTargetHref, setLeaveTargetHref] = useState<string | null>(null);
  const [leaveModalError, setLeaveModalError] = useState<string | null>(null);
  const [isLeaveSaving, setIsLeaveSaving] = useState(false);
  const [localDraftNotice, setLocalDraftNotice] = useState<string | null>(null);
  const [tipsPreferenceFeedback, setTipsPreferenceFeedback] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);
  const [tipsEnabled, setTipsEnabled] = useState(initialEditorTipsEnabled);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isTipsPreferenceSaving, setIsTipsPreferenceSaving] = useState(false);
  const [tipsDetailLevel, setTipsDetailLevel] = useState<EditorTipsDetailLevel>(
    initialEditorTipsDetailLevel,
  );
  const tipsHoverEnabled = tipsEnabled && tipsDetailLevel === "full";
  const tipsContextStripEnabled = tipsEnabled && tipsDetailLevel === "full";
  const [contextHint, setContextHint] = useState<string | null>(null);
  const [formatAutoMessage, setFormatAutoMessage] = useState<string | null>(null);
  const [activeBlockType, setActiveBlockType] = useState<ScreenplayBlockType>("action");
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [editorBlocks, setEditorBlocks] = useState<readonly SerializedEditorBlock[]>(initialSeed.blocks);
  const [editorSeedBlocks, setEditorSeedBlocks] = useState<readonly SerializedEditorBlock[]>(
    initialSeed.blocks,
  );
  const [editorInstanceKey, setEditorInstanceKey] = useState(0);
  const [projectRecord, setProjectRecord] = useState(initialProjectRecord);
  const [documentId, setDocumentId] = useState(initialData?.documentId ?? null);
  const [editorRevision, setEditorRevision] = useState(initialData?.revision ?? 0);

  const handleBlockTypeChange = useCallback((blockType: ScreenplayBlockType) => {
    setActiveBlockType(blockType);
  }, []);

  const syncFromEditorState = useCallback((editorState: EditorState) => {
    setEditorScenes(deriveSceneNavigators(editorState));
    setCaretActiveSceneKey(deriveActiveSceneKey(editorState));
    setEstimatedPages(estimatePagesFromEditorState(editorState));
  }, []);

  const sceneKeys = useMemo(() => editorScenes.map((s) => s.id), [editorScenes]);

  const scrollSpySceneKey = useSceneScrollSpy({
    editor: mountedEditor,
    sceneKeys,
    scrollRootRef: editorCanvasRef,
  });

  const displayActiveSceneKey = editorWritingFocused
    ? (caretActiveSceneKey ?? scrollSpySceneKey)
    : (scrollSpySceneKey ?? caretActiveSceneKey);

  const queuePrototypeSaveConfirmation = useCallback(() => {
    if (!prototypeMode) {
      return;
    }

    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }

    if (highlightFadeTimeoutRef.current) {
      window.clearTimeout(highlightFadeTimeoutRef.current);
    }

    setPrototypeSaveState("saving");
    setHighlightSaved(false);

    autosaveTimeoutRef.current = window.setTimeout(() => {
      setPrototypeSaveState("synced");
      setHighlightSaved(true);

      highlightFadeTimeoutRef.current = window.setTimeout(() => {
        setHighlightSaved(false);
      }, 2000);
    }, 900);
  }, [prototypeMode]);

  const persistLatestDraft = useCallback(async (): Promise<boolean> => {
    if (prototypeMode) {
      return true;
    }

    const currentProject = projectRecordRef.current;

    if (!currentProject) {
      return false;
    }

    const normalizedTitle = normalizeEditableProjectTitle(projectTitleRef.current);
    const nextSignature = createPersistSignature(normalizedTitle, editorBlocksRef.current);
    const requestedTitle = normalizedTitle;

    if (nextSignature === lastPersistedSignatureRef.current) {
      setHasUnsavedChanges(false);
      setPersistState("saved");
      setPersistErrorMessage(null);
      return true;
    }

    if (isOfflineRef.current) {
      setPersistState("local-draft");
      return false;
    }

    if (isSavingRef.current) {
      queuedPersistRef.current = true;
      return false;
    }

    if (savingIndicatorDelayRef.current !== null) {
      window.clearTimeout(savingIndicatorDelayRef.current);
      savingIndicatorDelayRef.current = null;
    }

    isSavingRef.current = true;
    setPersistErrorMessage(null);
    savingIndicatorDelayRef.current = window.setTimeout(() => {
      if (isSavingRef.current) {
        setPersistState("saving");
      }
    }, 450);

    const result = await saveProjectSnapshot(createSupabaseBrowserClient(), {
      blocks: editorBlocksRef.current,
      documentId: documentIdRef.current,
      project: currentProject,
      title: normalizedTitle,
    });

    if (savingIndicatorDelayRef.current !== null) {
      window.clearTimeout(savingIndicatorDelayRef.current);
      savingIndicatorDelayRef.current = null;
    }

    isSavingRef.current = false;

    if (result.error || !result.data) {
      setPersistState("error");
      setPersistErrorMessage(result.error?.message ?? "No se pudo sincronizar el documento.");
      queuedPersistRef.current = false;
      return false;
    }

    lastPersistedSignatureRef.current = createPersistSignature(
      normalizeEditableProjectTitle(result.data.project.title),
      result.data.blocks,
    );
    clearStoredEditorDraft(projectId);
    projectRecordRef.current = result.data.project;
    documentIdRef.current = result.data.documentId;
    setProjectRecord(result.data.project);
    setDocumentId(result.data.documentId);
    setEditorRevision(result.data.revision);

    if (normalizeEditableProjectTitle(projectTitleRef.current) === requestedTitle) {
      setProjectTitle(result.data.project.title);
    }
    setPersistState("saved");
    setPersistErrorMessage(null);
    setHasUnsavedChanges(false);
    setHighlightSaved(true);

    if (highlightFadeTimeoutRef.current) {
      window.clearTimeout(highlightFadeTimeoutRef.current);
    }

    highlightFadeTimeoutRef.current = window.setTimeout(() => {
      setHighlightSaved(false);
    }, 2000);

    if (queuedPersistRef.current) {
      queuedPersistRef.current = false;
      const latestSignature = createPersistSignature(
        normalizeEditableProjectTitle(projectTitleRef.current),
        editorBlocksRef.current,
      );

      if (latestSignature !== lastPersistedSignatureRef.current) {
        window.setTimeout(() => {
          void persistLatestDraftRef.current();
        }, 0);
      }
    }

    return true;
  }, [projectId, prototypeMode]);

  const schedulePersistOnEnter = useCallback(() => {
    void persistLatestDraftRef.current();
  }, []);

  const handleEditorReady = useCallback(
    (editor: LexicalEditor) => {
      lexicalEditorRef.current = editor;
      setMountedEditor(editor);
      syncFromEditorState(editor.getEditorState());
    },
    [syncFromEditorState],
  );

  const handleEditorChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      lexicalEditorRef.current = editor;
      syncFromEditorState(editorState);
      const nextBlocks = serializeScreenplayBlocks(editorState);
      editorBlocksRef.current = nextBlocks;
      setEditorBlocks(nextBlocks);

      const tipsFull = tipsEnabled && tipsDetailLevel === "full";

      if (tipsFull) {
        const prev = prevBlocksForFormatHintRef.current;
        if (prev && prev.length === nextBlocks.length) {
          for (let i = 0; i < nextBlocks.length; i++) {
            const p = prev[i]!;
            const n = nextBlocks[i]!;
            if (p.type === "action" && n.type === "scene-heading" && p.text === n.text) {
              const msg = getSceneHeadingAutoDetectReason(n.text);
              if (msg) {
                setFormatAutoMessage(msg);
              }
              break;
            }
            if (p.type === "action" && n.type === "transition" && p.text === n.text) {
              const msg = getTransitionAutoDetectReason(n.text);
              if (msg) {
                setFormatAutoMessage(msg);
              }
              break;
            }
          }
        }
        prevBlocksForFormatHintRef.current = nextBlocks;

        const ctx = deriveActiveBlockContext(editorState);
        if (ctx) {
          if (contextHintDebounceRef.current != null) {
            window.clearTimeout(contextHintDebounceRef.current);
          }
          contextHintDebounceRef.current = window.setTimeout(() => {
            contextHintDebounceRef.current = null;
            setContextHint(
              resolveScreenplayContextHint({
                blockType: ctx.blockType,
                lineText: ctx.text,
              }),
            );
          }, 420);
        }
      } else {
        prevBlocksForFormatHintRef.current = nextBlocks;
        if (contextHintDebounceRef.current != null) {
          window.clearTimeout(contextHintDebounceRef.current);
          contextHintDebounceRef.current = null;
        }
        setContextHint(null);
      }

      if (prototypeMode) {
        queuePrototypeSaveConfirmation();
      }
    },
    [prototypeMode, queuePrototypeSaveConfirmation, syncFromEditorState, tipsDetailLevel, tipsEnabled],
  );

  const handleBlockTypeSelect = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (!isScreenplayBlockType(value)) {
      return;
    }

    const editor = lexicalEditorRef.current;

    if (!editor) {
      return;
    }

    editor.dispatchCommand(SET_BLOCK_TYPE_COMMAND, { blockType: value });
    setActiveBlockType(value);
  }, []);

  useEffect(() => {
    setTipsEnabled(initialEditorTipsEnabled);
  }, [initialEditorTipsEnabled]);

  useEffect(() => {
    setTipsDetailLevel(initialEditorTipsDetailLevel);
  }, [initialEditorTipsDetailLevel]);

  useEffect(() => {
    if (!tipsContextStripEnabled) {
      setContextHint(null);
      setFormatAutoMessage(null);
      if (contextHintDebounceRef.current != null) {
        window.clearTimeout(contextHintDebounceRef.current);
        contextHintDebounceRef.current = null;
      }
    }
  }, [tipsContextStripEnabled]);

  useEffect(() => {
    if (!formatAutoMessage) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setFormatAutoMessage(null);
    }, 4800);
    return () => {
      window.clearTimeout(timer);
    };
  }, [formatAutoMessage]);

  useEffect(() => {
    return () => {
      if (contextHintDebounceRef.current != null) {
        window.clearTimeout(contextHintDebounceRef.current);
      }
    };
  }, []);

  const handleDisableEditorTips = useCallback(async () => {
    if (isTipsPreferenceSaving) {
      return;
    }

    setIsTipsPreferenceSaving(true);
    setTipsPreferenceFeedback(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTipsPreferenceFeedback({
          tone: "error",
          message: "Iniciá sesión de nuevo para guardar esta preferencia.",
        });
        return;
      }

      const { error } = await mergeUserProfilePreferences(supabase, user.id, {
        editorTipsEnabled: false,
      });

      if (error) {
        setTipsPreferenceFeedback({
          tone: "error",
          message: "No pudimos guardar. Revisá la conexión o probá desde Ajustes → Editor.",
        });
        return;
      }

      setTipsEnabled(false);
      setIsGlossaryOpen(false);
      setContextHint(null);
      setFormatAutoMessage(null);
      if (contextHintDebounceRef.current != null) {
        window.clearTimeout(contextHintDebounceRef.current);
        contextHintDebounceRef.current = null;
      }
      setTipsPreferenceFeedback({
        tone: "success",
        message: "Ayudas desactivadas. Podés volver a activarlas en Ajustes → Editor.",
      });
    } catch {
      setTipsPreferenceFeedback({
        tone: "error",
        message: "No pudimos guardar. Probá desde Ajustes → Editor.",
      });
    } finally {
      setIsTipsPreferenceSaving(false);
    }
  }, [isTipsPreferenceSaving]);

  const handleSceneNavigate = useCallback((sceneKey: string) => {
    const editor = lexicalEditorRef.current;

    if (!editor) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(sceneKey);

      if (node && $isScreenplayBlockNode(node)) {
        node.selectEnd();
      }
    });

    queueMicrotask(() => {
      const element = editor.getElementByKey(sceneKey);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  useEffect(() => {
    const focusRoot = editorFocusRootRef.current;
    if (!focusRoot) {
      return undefined;
    }

    function onFocusIn() {
      setEditorWritingFocused(true);
    }

    function onFocusOut(event: FocusEvent) {
      const r = editorFocusRootRef.current;
      const next = event.relatedTarget as Node | null;
      if (!r) {
        setEditorWritingFocused(false);
        return;
      }
      if (!next || !r.contains(next)) {
        setEditorWritingFocused(false);
      }
    }

    focusRoot.addEventListener("focusin", onFocusIn);
    focusRoot.addEventListener("focusout", onFocusOut);
    return () => {
      focusRoot.removeEventListener("focusin", onFocusIn);
      focusRoot.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  /** Keep the active scene row visible inside the sidebar when the scene list scrolls (Day 11 / Day 24). */
  useEffect(() => {
    if (!isSidebarVisible || !displayActiveSceneKey) {
      return;
    }

    const button = activeSceneNavButtonRef.current;
    button?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [displayActiveSceneKey, isSidebarVisible]);

  const editorInstanceKeyBootRef = useRef(true);
  useEffect(() => {
    if (editorInstanceKeyBootRef.current) {
      editorInstanceKeyBootRef.current = false;
      return;
    }
    setMountedEditor(null);
  }, [editorInstanceKey]);

  useEffect(() => {
    persistLatestDraftRef.current = persistLatestDraft;
  }, [persistLatestDraft]);

  useEffect(() => {
    projectRecordRef.current = projectRecord;
  }, [projectRecord]);

  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  useEffect(() => {
    editorBlocksRef.current = editorBlocks;
  }, [editorBlocks]);

  useEffect(() => {
    projectTitleRef.current = projectTitle;
  }, [projectTitle]);

  useEffect(() => {
    if (prototypeMode) {
      return undefined;
    }

    function syncConnectivityState() {
      const nextOfflineState = !window.navigator.onLine;
      isOfflineRef.current = nextOfflineState;
      setIsBrowserOffline(nextOfflineState);
    }

    syncConnectivityState();
    window.addEventListener("online", syncConnectivityState);
    window.addEventListener("offline", syncConnectivityState);

    return () => {
      window.removeEventListener("online", syncConnectivityState);
      window.removeEventListener("offline", syncConnectivityState);
    };
  }, [prototypeMode]);

  useEffect(() => {
    if (prototypeMode || !projectRecord || restoredLocalDraftRef.current) {
      return;
    }

    restoredLocalDraftRef.current = true;
    const storedDraft = readStoredEditorDraft(projectRecord.id);

    if (!storedDraft) {
      return;
    }

    const canRestoreDraft =
      storedDraft.baseRevision === editorRevision && storedDraft.documentId === documentId;

    if (!canRestoreDraft) {
      clearStoredEditorDraft(projectRecord.id);
      return;
    }

    const restoreAnimationFrame = window.requestAnimationFrame(() => {
      setProjectTitle(storedDraft.title);
      setEditorBlocks(storedDraft.blocks);
      setEditorSeedBlocks(storedDraft.blocks);
      setEstimatedPages(estimateScreenplayPageCount(storedDraft.blocks));
      setHasUnsavedChanges(true);
      setPersistState("local-draft");
      setEditorInstanceKey((currentValue) => currentValue + 1);
      setLocalDraftNotice("Recuperamos un borrador pendiente guardado en este navegador.");
    });

    return () => {
      window.cancelAnimationFrame(restoreAnimationFrame);
    };
  }, [documentId, editorRevision, projectRecord, prototypeMode]);

  useEffect(() => {
    if (!localDraftNotice) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setLocalDraftNotice(null);
    }, 8000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [localDraftNotice]);

  useEffect(() => {
    if (!tipsPreferenceFeedback || tipsPreferenceFeedback.tone !== "success") {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setTipsPreferenceFeedback(null);
    }, 6000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [tipsPreferenceFeedback]);

  useEffect(() => {
    if (prototypeMode || !hasUnsavedChanges) {
      return undefined;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, prototypeMode]);

  useEffect(() => {
    if (prototypeMode || !projectRecord) {
      return;
    }

    const normalizedTitle = normalizeEditableProjectTitle(projectTitle);
    const nextSignature = createPersistSignature(normalizedTitle, editorBlocks);
    const isDirty = nextSignature !== lastPersistedSignatureRef.current;

    setHasUnsavedChanges(isDirty);

    if (!isDirty) {
      clearStoredEditorDraft(projectRecord.id);

      if (!isSavingRef.current) {
        setPersistState("saved");
      }

      return;
    }

    writeStoredEditorDraft(projectRecord.id, {
      baseRevision: editorRevision,
      blocks: editorBlocks,
      documentId,
      title: normalizedTitle,
      updatedAt: new Date().toISOString(),
    });

    if (isBrowserOffline || viewState === "offline") {
      setPersistState("local-draft");
    }
  }, [
    // Include `persistLatestDraft` so dev Fast Refresh never shrinks this array vs a prior version.
    documentId,
    editorBlocks,
    editorRevision,
    isBrowserOffline,
    persistLatestDraft,
    projectRecord,
    projectTitle,
    prototypeMode,
    viewState,
  ]);

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }

      if (highlightFadeTimeoutRef.current) {
        window.clearTimeout(highlightFadeTimeoutRef.current);
      }

      if (savingIndicatorDelayRef.current !== null) {
        window.clearTimeout(savingIndicatorDelayRef.current);
      }

      if (titlePersistTimeoutRef.current !== null) {
        window.clearTimeout(titlePersistTimeoutRef.current);
      }
    };
  }, []);

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
    return <EditorLoadingScreen title={initialTitle} />;
  }

  const status = getStatusPresentation({
    hasUnsavedChanges,
    highlightSaved,
    isOffline: prototypeMode ? viewState === "offline" : isBrowserOffline || viewState === "offline",
    persistState,
    prototypeMode,
    prototypeSaveState,
    viewState,
  });
  const isOffline = prototypeMode ? viewState === "offline" : isBrowserOffline || viewState === "offline";
  const activeEditorScene =
    editorScenes.find((scene) => scene.id === displayActiveSceneKey) ?? null;
  const exportAuthor = projectRecord?.author ?? initialSeed.author ?? previewUser.name;
  const blockTypeGlossaryEntry = getGlossaryEntryForBlockType(activeBlockType);
  const pageMinuteGlossaryEntry = getGlossaryEntryById("page-minute");
  const sceneGlossaryEntry = getGlossaryEntryById("scene");
  const hasContextHint =
    tipsContextStripEnabled && (formatAutoMessage != null || contextHint != null);
  const hasHelpBarLeading = tipsContextStripEnabled;

  function handleTitleChange(nextTitle: string) {
    setProjectTitle(nextTitle);

    if (prototypeMode) {
      queuePrototypeSaveConfirmation();
      return;
    }

    if (!editorAutosaveEnabled) {
      return;
    }

    if (titlePersistTimeoutRef.current !== null) {
      window.clearTimeout(titlePersistTimeoutRef.current);
    }

    titlePersistTimeoutRef.current = window.setTimeout(() => {
      titlePersistTimeoutRef.current = null;
      void persistLatestDraftRef.current();
    }, 3200);
  }

  function handleTitleBlur() {
    if (prototypeMode) {
      return;
    }

    if (!editorAutosaveEnabled) {
      return;
    }

    if (titlePersistTimeoutRef.current !== null) {
      window.clearTimeout(titlePersistTimeoutRef.current);
      titlePersistTimeoutRef.current = null;
    }

    void persistLatestDraftRef.current();
  }

  async function handleLeaveSaveAndNavigate() {
    setLeaveModalError(null);
    setIsLeaveSaving(true);
    const ok = await persistLatestDraftRef.current();
    setIsLeaveSaving(false);
    if (ok) {
      const href = leaveTargetHref;
      setLeaveTargetHref(null);
      if (href) {
        router.push(href);
      }
    } else {
      setLeaveModalError(
        isOfflineRef.current
          ? "Sin conexión no podemos sincronizar. Podés salir igual; los cambios siguen en este navegador."
          : "No pudimos guardar en el servidor. Reintentá o salí sin guardar.",
      );
    }
  }

  function handleLeaveWithoutSaving() {
    const href = leaveTargetHref;
    setLeaveTargetHref(null);
    setLeaveModalError(null);
    if (href) {
      router.push(href);
    }
  }

  function handleOpenExportModal() {
    setIsExportModalOpen(true);
  }

  return (
    <div className={styles.editorShell}>
      {localDraftNotice ? (
        <p className={styles.editorTransientNotice} role="status">
          {localDraftNotice}
        </p>
      ) : null}
      {isOffline ? (
        <div className={styles.inlineNotice}>
          Sin conexión. Los cambios quedan guardados en este navegador hasta recuperar la red.
        </div>
      ) : persistErrorMessage ? (
        <div className={cn(styles.inlineNotice, styles.editorPersistBanner)} role="alert">
          <span>Guardado pendiente; copia local activa.</span>
          <span className={styles.inlineNoticeDetail}>
            {mapPersistErrorForDisplay(persistErrorMessage)}
          </span>
        </div>
      ) : null}

      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderTop}>
          <div className={styles.editorHeaderLeading}>
            <Link
              href={routes.projects}
              className={styles.editorBack}
              onClick={(event) => {
                if (!prototypeMode && hasUnsavedChanges) {
                  event.preventDefault();
                  setLeaveModalError(null);
                  setLeaveTargetHref(routes.projects);
                }
              }}
            >
              ← Proyectos
            </Link>
            <div className={styles.editorTitleCluster}>
              <input
                type="text"
                className={styles.editorTitleInput}
                aria-label="Título del proyecto"
                value={projectTitle}
                onChange={(event) => handleTitleChange(event.target.value)}
                onBlur={handleTitleBlur}
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
            <div className={styles.editorBlockTypeCluster}>
              {tipsHoverEnabled && blockTypeGlossaryEntry ? (
                <HoverDelayTip content={<GlossaryTooltipBody entry={blockTypeGlossaryEntry} />}>
                  <div className={styles.editorBlockTypeHoverWrap}>
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
                </HoverDelayTip>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className={styles.editorHeaderActions}>
            {tipsHoverEnabled ? (
              <HoverDelayTip content={<ScenesToggleTooltipBody />} delayMs={720}>
                <button
                  type="button"
                  className={styles.editorIconButton}
                  onClick={() => setIsSidebarVisible((currentValue) => !currentValue)}
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
              </HoverDelayTip>
            ) : (
              <button
                type="button"
                className={styles.editorIconButton}
                onClick={() => setIsSidebarVisible((currentValue) => !currentValue)}
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
            )}
            <Link
              href={routes.settings}
              className={styles.editorHeaderQuiet}
              onClick={(event) => {
                if (!prototypeMode && hasUnsavedChanges) {
                  event.preventDefault();
                  setLeaveModalError(null);
                  setLeaveTargetHref(routes.settings);
                }
              }}
            >
              Ajustes
            </Link>
            {!prototypeMode ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasUnsavedChanges || persistState === "saving" || !projectRecord}
                onClick={() => void persistLatestDraftRef.current()}
              >
                {persistState === "saving" ? "Guardando…" : "Guardar"}
              </Button>
            ) : null}
            <Button variant="secondary" size="sm" onClick={handleOpenExportModal}>
              Exportar
            </Button>
          </div>
        </div>

        {tipsEnabled ? (
          <div className={styles.editorHelpDismissBar}>
            <div
              className={cn(
                styles.editorHelpDismissMainRow,
                hasHelpBarLeading && styles.editorHelpDismissMainRowWithHint,
              )}
            >
              {hasHelpBarLeading ? (
                hasContextHint ? (
                  <p className={styles.editorContextHintInline} role="status" aria-live="polite">
                    {formatAutoMessage ?? contextHint}
                  </p>
                ) : (
                  <div className={styles.editorContextHintInline} role="status" aria-live="polite">
                    <span>Abrí el </span>
                    <button
                      type="button"
                      className={styles.editorContextHintGlossaryTrigger}
                      onClick={() => setIsGlossaryOpen(true)}
                    >
                      Glosario
                    </button>
                    <span>
                      {" "}
                      y buscá qué querés hacer (escena, diálogo, personaje, INT./EXT., transición…).
                    </span>
                  </div>
                )
              ) : null}
              <div className={styles.editorHelpDismissActions}>
                {hasContextHint || !hasHelpBarLeading ? (
                  <button
                    type="button"
                    className={styles.editorHelpGlossaryLink}
                    onClick={() => setIsGlossaryOpen(true)}
                  >
                    Glosario
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.editorHelpDismissLink}
                  disabled={isTipsPreferenceSaving}
                  onClick={() => void handleDisableEditorTips()}
                >
                  {isTipsPreferenceSaving ? "Guardando…" : "Ocultar ayudas"}
                </button>
              </div>
            </div>
            {tipsPreferenceFeedback ? (
              <p
                className={cn(
                  styles.editorHelpFeedback,
                  tipsPreferenceFeedback.tone === "error"
                    ? styles.editorHelpFeedbackError
                    : styles.editorHelpFeedbackSuccess,
                )}
                role="status"
              >
                {tipsPreferenceFeedback.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <div
        className={cn(
          styles.editorWorkspace,
          !isSidebarVisible && styles.editorWorkspaceSolo,
          isSidebarVisible && "foundation-editor-grid foundation-editor-grid--nav-first",
        )}
      >
        <aside
          className={cn(styles.editorSidebar, !isSidebarVisible && styles.editorSidebarHidden)}
          aria-label="Sidebar de escenas"
        >
          <div className={styles.editorSidebarHeader}>
            {tipsHoverEnabled && sceneGlossaryEntry ? (
              <HoverDelayTip
                className={styles.editorSidebarTitleWrap}
                content={<ScenesPanelTooltipBody />}
              >
                <p className={cn("foundation-kicker", styles.editorTipDotted)}>
                  Escenas
                  <span className={styles.editorSceneCount}> · {editorScenes.length}</span>
                </p>
              </HoverDelayTip>
            ) : (
              <p className="foundation-kicker">
                Escenas
                <span className={styles.editorSceneCount}> · {editorScenes.length}</span>
              </p>
            )}
            <button
              type="button"
              className={styles.editorSidebarToggle}
              onClick={() => setIsSidebarVisible(false)}
            >
              Cerrar
            </button>
          </div>

          <div className={styles.editorSidebarBody}>
            {editorScenes.length === 0 ? (
              <div className={styles.sceneEmpty}>
                <div>
                  <div>Sin escenas todavía</div>
                  <div>Añade un bloque Encabezado (o Tab hasta Encabezado) y escribe INT./EXT.</div>
                </div>
              </div>
            ) : (
              <ol className="foundation-scene-list">
                {editorScenes.map((scene) => (
                  <li key={scene.id}>
                    <button
                      type="button"
                      ref={scene.id === displayActiveSceneKey ? activeSceneNavButtonRef : undefined}
                      className="foundation-scene-item"
                      data-active={displayActiveSceneKey === scene.id ? "true" : "false"}
                      aria-current={displayActiveSceneKey === scene.id ? "true" : undefined}
                      onClick={() => handleSceneNavigate(scene.id)}
                    >
                      <span className="foundation-scene-item__index">{scene.indexLabel}</span>
                      <span className="foundation-scene-item__title">{scene.heading}</span>
                      {scene.snippet ? (
                        <span className="foundation-scene-item__snippet">{scene.snippet}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>

        <main ref={editorCanvasRef} className={styles.editorCanvas}>
          <div className={styles.editorCanvasStage}>
            <article ref={editorFocusRootRef} className={styles.editorPaper}>
              <ScreenplayEditor
                key={`screenplay-editor-${editorInstanceKey}`}
                initialBlocks={toScreenplayEditorSeedBlocks(editorSeedBlocks)}
                onEditorReady={handleEditorReady}
                onChange={handleEditorChange}
                onBlockTypeChange={handleBlockTypeChange}
                onEnterPersist={
                  prototypeMode || !editorAutosaveEnabled ? undefined : schedulePersistOnEnter
                }
                persistOnEnterEnabled={!prototypeMode && editorAutosaveEnabled}
                placeholder="Empieza a escribir tu guión..."
              />
            </article>
          </div>
        </main>
      </div>

      <footer className={styles.editorFooter}>
        <div className={styles.editorFooterMeta}>
          {tipsHoverEnabled && blockTypeGlossaryEntry ? (
            <HoverDelayTip content={<GlossaryTooltipBody entry={blockTypeGlossaryEntry} />}>
              <span className={styles.editorTipDotted}>{BLOCK_TYPE_LABEL_ES[activeBlockType]}</span>
            </HoverDelayTip>
          ) : (
            <span>{BLOCK_TYPE_LABEL_ES[activeBlockType]}</span>
          )}
          {tipsHoverEnabled && pageMinuteGlossaryEntry ? (
            <HoverDelayTip content={<GlossaryTooltipBody entry={pageMinuteGlossaryEntry} />}>
              <span className={styles.editorTipDotted}>~{estimatedPages} páginas</span>
            </HoverDelayTip>
          ) : (
            <span>~{estimatedPages} páginas</span>
          )}
        </div>
        <div className={styles.editorFooterMeta}>
          {tipsHoverEnabled && sceneGlossaryEntry ? (
            <HoverDelayTip content={<GlossaryTooltipBody entry={sceneGlossaryEntry} />}>
              <span className={styles.editorTipDotted}>{editorScenes.length} escenas</span>
            </HoverDelayTip>
          ) : (
            <span>{editorScenes.length} escenas</span>
          )}
          <span>{activeEditorScene ? activeEditorScene.indexLabel : "Sin escena activa"}</span>
        </div>
      </footer>

      <EditorGlossaryModal open={isGlossaryOpen} onOpenChange={setIsGlossaryOpen} />

      <Modal
        open={leaveTargetHref !== null}
        onOpenChange={(open) => {
          if (!open && !isLeaveSaving) {
            setLeaveTargetHref(null);
            setLeaveModalError(null);
          }
        }}
        title="¿Guardar antes de salir?"
        description="Tenés cambios que todavía no están sincronizados con el servidor."
        closeLabel="Seguir editando"
        footer={
          <>
            <Button variant="ghost" disabled={isLeaveSaving} onClick={() => handleLeaveWithoutSaving()}>
              Salir sin guardar
            </Button>
            <Button
              variant="primary"
              disabled={isLeaveSaving}
              onClick={() => void handleLeaveSaveAndNavigate()}
            >
              {isLeaveSaving ? "Guardando…" : "Guardar y salir"}
            </Button>
          </>
        }
      >
        {leaveModalError ? <p className={styles.editorLeaveModalError}>{leaveModalError}</p> : null}
      </Modal>

      <Modal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Exportar guion"
        closeLabel="Cerrar modal"
        footer={
          <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        <div className={styles.modalSection}>
          <div className={styles.modalSummary}>
            <div className={styles.modalSummaryRow}>
              <span>Título</span>
              <strong>{normalizeEditableProjectTitle(projectTitle)}</strong>
            </div>
            <div className={styles.modalSummaryRow}>
              <span>Autor</span>
              <strong>{exportAuthor ?? "Sin definir"}</strong>
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

          <p className={styles.modalMessage}>
            La exportación PDF todavía no está conectada al documento persistido.
          </p>
          <p className={styles.modalHint}>
            Dejé el resumen listo para cuando implementemos Fase 9 sobre el snapshot activo.
          </p>
        </div>
      </Modal>
    </div>
  );
}
