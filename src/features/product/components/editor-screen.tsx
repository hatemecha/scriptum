"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";

import { $getNodeByKey, type EditorState, type LexicalEditor } from "lexical";
import { Eye, EyeOff, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HoverDelayTip } from "@/components/ui/hover-delay-tip";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
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
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import { resolveScreenplayContextHint } from "@/features/screenplay/editor-help/context-hints";
import {
  getGlossaryEntryById,
  getGlossaryEntryForBlockType,
  type ScreenplayGlossaryEntry,
} from "@/features/screenplay/editor-help/glossary";
import { getSceneHeadingAutoDetectReason } from "@/features/screenplay/editor-help/scene-heading-detect";
import { getTransitionAutoDetectReason } from "@/features/screenplay/editor-help/transition-detect";
import { estimateScreenplayPageCount } from "@/features/screenplay/page-estimate";
import { buildScreenplayPdfFromBlocks } from "@/features/screenplay/screenplay-pdf";
import { layoutScreenplayForExport } from "@/features/screenplay/screenplay-layout";
import {
  clearStoredEditorDraft,
  readStoredEditorDraft,
  writeStoredEditorDraft,
} from "@/features/product/editor-draft";
import { getPreviewLines, getPreviewProject, previewUser } from "@/features/product/preview-data";
import { type EditorViewState } from "@/features/product/view-states";
import { mapPersistErrorForDisplay } from "@/features/projects/persist-user-messages";
import {
  normalizeSerializedBlocksForPersist,
  saveProjectSnapshot,
  type PersistedProjectEditorData,
  type SerializedEditorBlock,
} from "@/features/projects/project-snapshots";
import {
  flushPreferenceOverlayToServer,
  mergeUserProfilePreferencesResilient,
  offlinePreferenceSuccessMessage,
  readPreferenceOverlay,
} from "@/features/user/local-profile-preferences-overlay";
import { type EditorTipsDetailLevel } from "@/features/user/profile";
import { getSupabaseBrowserClientWithUser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { EditorGlossaryModal } from "./editor-glossary-modal";
import { StatePanel } from "./state-panel";
import {
  DraggableScenesPanel,
  DraggableScriptMetaPanel,
  DroppableEditorSide,
  EditorWorkspaceDnd,
  EDITOR_DROP_LEFT,
  EDITOR_DROP_RIGHT,
  type ScenePanelSide,
} from "./editor-workspace-dnd";
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
  userId: string;
  viewState: EditorViewState;
};

type SaveTone = "danger" | "muted" | "success" | "warning";

type ExportModalPhase = "error" | "exporting" | "ready" | "success";

const MOBILE_EDITOR_MEDIA_QUERY = "(max-width: 768px)";

const SCENE_PANEL_SIDE_STORAGE_KEY = "scriptum:editor-scene-panel-side";

const SCRIPT_STATS_NUMBER_FORMAT = new Intl.NumberFormat("es-419");

function computeEditorScriptStats(blocks: readonly SerializedEditorBlock[]): {
  characters: number;
  letters: number;
  words: number;
} {
  const text = blocks.map((b) => b.text).join("\n");
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  return {
    characters: text.length,
    letters,
    words,
  };
}

function sanitizeExportFileName(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/\s+/g, "-");
  const safe = trimmed.replace(/[^a-z0-9._-]+/g, "").replace(/^-+|-+$/g, "");
  return safe.length > 0 ? safe.slice(0, 88) : "guion";
}
type PrototypeSaveState = "saving" | "synced";
type PersistState = "error" | "local-draft" | "saved" | "saving";

type SaveStatusIconKind = "saved" | "unsaved" | "saving" | "offline" | "local" | "error";

type StatusPresentation = {
  label: string;
  tone: SaveTone;
  /** Para tooltip al pasar el mouse (lectura detallada del estado). */
  detail: string;
  icon: SaveStatusIconKind;
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

function SaveStatusTooltipBody({ label, detail }: { label: string; detail: string }) {
  return (
    <>
      <strong>{label}</strong>
      <p>{detail}</p>
    </>
  );
}

function SaveStatusGlyph({ kind }: { kind: SaveStatusIconKind }) {
  const common = {
    className: styles.editorSaveStatusGlyph,
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "saved":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
      );
    case "unsaved":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
      );
    case "saving":
      return (
        <svg
          {...common}
          className={cn(styles.editorSaveStatusGlyph, styles.editorSaveStatusGlyphSpin)}
        >
          <path
            fill="currentColor"
            d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm0-2v4l2.5-2.5L12 2z"
          />
        </svg>
      );
    case "offline":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M19.35 10.04A7.49 7.49 0 0 0 12 4c-1.48 0-2.85.43-4.01 1.17l1.65 1.65A5.5 5.5 0 0 1 12 6c3.04 0 5.5 2.46 5.5 5.5v.5h1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H12c-2.21 0-4-1.79-4-4 0-1.1.45-2.1 1.17-2.83L3 4.41 1.59 5.83 18.17 22.41 19.59 21l-4.1-4.1zM12 18h8.17l-8.17-8.17V18z"
          />
        </svg>
      );
    case "local":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2zm0 2 2 2h8v10H4V6h6V4zm2 8v2h8v-2h-8zm0-4v2h5V8h-5z"
          />
        </svg>
      );
    case "error":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function normalizeEditableProjectTitle(value: string): string {
  const normalizedValue = value.replace(/\s+/g, " ").trim();
  return normalizedValue.length > 0 ? normalizedValue : "Sin título";
}

function createPersistSignature(title: string, blocks: readonly SerializedEditorBlock[]): string {
  return JSON.stringify({ blocks, title });
}

/** Same shaping as `saveProjectSnapshot` so “dirty” matches what actually syncs (avoids false unsaved after guardar). */
function persistComparisonSignature(
  titleInput: string,
  blocks: readonly SerializedEditorBlock[],
): string {
  const title = normalizeEditableProjectTitle(titleInput);
  const normalizedBlocks = normalizeSerializedBlocksForPersist(blocks);
  return createPersistSignature(title, normalizedBlocks);
}

function isLikelyTransientPersistError(error: Error | null | undefined): boolean {
  if (!error) {
    return false;
  }
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof (error as { code?: string }).code === "string"
    ? (error as { code: string }).code
    : "";
  return (
    error.name === "TypeError" ||
    code === "401" ||
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    message.includes("timeout") ||
    message.includes("econnreset")
  );
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
        icon: "offline",
        detail:
          "Este modo prototipo simula estar sin red. En el editor real, los cambios quedan en el navegador hasta volver la conexión.",
      };
    }

    if (viewState === "save-error") {
      return {
        label: "Error al guardar",
        tone: "danger",
        icon: "error",
        detail:
          "Algo falló al guardar en la simulación; en producción verías copia local y reintento.",
      };
    }

    if (viewState === "unsaved") {
      return {
        label: "Sin guardar",
        tone: "warning",
        icon: "unsaved",
        detail:
          "Hay cambios que todavía no se marcaron como guardados en este flujo de demostración.",
      };
    }

    if (viewState === "syncing") {
      return {
        label: "Sincronizando...",
        tone: "muted",
        icon: "saving",
        detail:
          "Simulamos la sincronización con el servidor; el icono gira mientras dura el proceso.",
      };
    }

    if (viewState === "saving" || prototypeSaveState === "saving") {
      return {
        label: "Guardando...",
        tone: "muted",
        icon: "saving",
        detail:
          "Enviando el borrador al servidor o guardándolo en la simulación. No cierres la pestaña si podés evitarlo.",
      };
    }

    return {
      label: "Guardado",
      tone: highlightSaved ? "success" : "muted",
      icon: "saved",
      detail: highlightSaved
        ? "Listo: el último guardado se confirmó hace un momento."
        : "No hay cambios pendientes respecto al último guardado conocido.",
    };
  }

  if (isOffline) {
    return {
      label: "Guardado en local",
      tone: "warning",
      icon: "offline",
      detail:
        "Sin conexión: el guion sigue en este navegador. Cuando vuelva la red, podés usar «Guardar» para sincronizar con tu cuenta.",
    };
  }

  if (persistState === "error") {
    return {
      label: "Cambios en local",
      tone: "danger",
      icon: "error",
      detail:
        "No pudimos completar el último guardado en el servidor; seguís editando una copia segura en este dispositivo. Reintentá «Guardar» o revisá la conexión.",
    };
  }

  if (persistState === "local-draft" && !hasUnsavedChanges) {
    return {
      label: "Cambios en local",
      tone: "warning",
      icon: "local",
      detail:
        "Hay un borrador recuperado o pendiente solo en este navegador. Guardá en el servidor cuando puedas para unificar la versión.",
    };
  }

  if (persistState === "saving") {
    return {
      label: "Guardando...",
      tone: "muted",
      icon: "saving",
      detail:
        "Estamos enviando el guion al servidor. Si tarda, comprobá la conexión pero no hace falta perder lo ya escrito.",
    };
  }

  if (hasUnsavedChanges) {
    return {
      label: "Sin guardar",
      tone: "warning",
      icon: "unsaved",
      detail:
        "Editaste el guion o el título y todavía no coinciden con el último guardado en el servidor. Pulsá «Guardar» o activá el autoguardado en Ajustes → Editor.",
    };
  }

  return {
    label: "Guardado",
    tone: highlightSaved ? "success" : "muted",
    icon: "saved",
    detail: highlightSaved
      ? "El borrador quedó sincronizado con el servidor hace un instante."
      : "No hay diferencias pendientes: lo último en pantalla coincide con el guardado en tu cuenta.",
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

type EditorPanelKind = "data" | "scenes";

function EditorPanelVisibilityEye({
  className,
  compact,
  isOpen,
  onToggle,
  panel,
}: {
  className?: string;
  compact?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  panel: EditorPanelKind;
}) {
  const label = isOpen
    ? panel === "scenes"
      ? "Ocultar lista de escenas"
      : "Ocultar datos del guion"
    : panel === "scenes"
      ? "Mostrar lista de escenas"
      : "Mostrar datos del guion";

  return (
    <button
      type="button"
      className={cn(
        styles.editorPanelVisibilityEye,
        compact && styles.editorPanelVisibilityEyeCompact,
        className,
      )}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={isOpen}
    >
      {isOpen ? (
        <Eye
          className={styles.editorSidebarEyeIcon}
          size={compact ? 16 : 17}
          strokeWidth={1.6}
          aria-hidden
        />
      ) : (
        <EyeOff
          className={styles.editorSidebarEyeIcon}
          size={compact ? 16 : 17}
          strokeWidth={1.6}
          aria-hidden
        />
      )}
    </button>
  );
}

function EditorSidePanelCollapsedStrip({
  onExpand,
  panel,
}: {
  onExpand: () => void;
  panel: EditorPanelKind;
}) {
  const regionLabel =
    panel === "scenes" ? "Lista de escenas colapsada" : "Datos del guion colapsados";

  return (
    <div className={styles.editorSidePanelCollapsedStrip} role="region" aria-label={regionLabel}>
      <EditorPanelVisibilityEye
        className={styles.editorPanelVisibilityEyeInStrip}
        isOpen={false}
        panel={panel}
        onToggle={onExpand}
      />
    </div>
  );
}

function EditorLoadingScreen({ title }: { title: string }) {
  return (
    <div className={styles.editorShell}>
      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderTop}>
          <div className={styles.editorHeaderLeading}>
            <div className={styles.editorHeaderIdentity}>
              <Link href={routes.projects} className={styles.editorBack}>
                ← Proyectos
              </Link>
              <div className={styles.editorTitleRow}>
                <Skeleton height="1.5rem" width="min(16rem, 52vw)" radius="0.35rem" />
                <Skeleton height="2.25rem" width="2.25rem" radius="0.65rem" />
              </div>
            </div>
          </div>

          <div className={styles.editorHeaderTrailing}>
            <div className={styles.editorHeaderFileCluster}>
              <Skeleton height="2.25rem" width="4.5rem" radius="0.65rem" />
              <Skeleton height="2.25rem" width="5.5rem" radius="0.75rem" />
            </div>
          </div>
        </div>
      </header>

      <div className={cn(styles.editorWorkspace, styles.editorWorkspaceTriple)}>
        <div className={styles.editorWorkspaceTripleInner}>
          <div className={styles.editorWorkspaceSideSlot}>
            <aside className={styles.editorSidebar} aria-label="Lista de escenas">
              <div className={styles.skeletonList}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`scene-skeleton-${index}`} className={styles.skeletonRowMain}>
                    <Skeleton height="0.85rem" width="34%" radius="999px" />
                    <Skeleton height="1.05rem" width="88%" radius="0.75rem" />
                  </div>
                ))}
              </div>
            </aside>
          </div>

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

          <div className={styles.editorWorkspaceSideSlot}>
            <aside className={styles.editorMetaSidebar}>
              <div className={styles.editorMetaSidebarHeader}>
                <p className="foundation-kicker">Datos del guion</p>
              </div>
              <div className={styles.editorMetaSidebarBody}>
                <div className={styles.skeletonList}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`meta-skeleton-${index}`} className={styles.skeletonRowMain}>
                      <Skeleton height="0.8rem" width="40%" radius="999px" />
                      <Skeleton height="1rem" width="72%" radius="0.75rem" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <footer className={styles.editorFooter}>
        <div className={styles.editorFooterMeta}>
          <span>Documento</span>
          <span>{title}</span>
        </div>
        <div className={styles.editorFooterMeta} aria-label="Estadísticas del guion">
          <span>— palabras</span>
          <span className={styles.editorFooterStatSep} aria-hidden>
            ·
          </span>
          <span>— caracteres</span>
          <span className={styles.editorFooterStatSep} aria-hidden>
            ·
          </span>
          <span>— letras</span>
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
  userId,
  viewState,
}: EditorScreenProps) {
  const [initialSeed] = useState(() =>
    buildEditorSeed(projectId, prototypeMode, viewState, initialData),
  );
  const initialProjectRecord = initialData?.project ?? null;
  const initialTitle = initialSeed.title;
  const initialSignature = persistComparisonSignature(initialTitle, initialSeed.blocks);
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
  const editorAutosaveEnabledRef = useRef(initialEditorAutosaveEnabled);
  const onlineReconnectPersistTimeoutRef = useRef<number | null>(null);
  const autoCollapsedSidebarRef = useRef(false);

  const [prototypeSaveState, setPrototypeSaveState] = useState<PrototypeSaveState>(
    viewState === "saving" ? "saving" : "synced",
  );
  const [persistState, setPersistState] = useState<PersistState>(prototypeMode ? "saved" : "saved");
  const [persistErrorMessage, setPersistErrorMessage] = useState<string | null>(null);
  const [isBrowserOffline, setIsBrowserOffline] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [isScenesPanelVisible, setIsScenesPanelVisible] = useState(true);
  const [isDataPanelVisible, setIsDataPanelVisible] = useState(true);
  const [scenePanelSide, setScenePanelSide] = useState<ScenePanelSide>("left");
  const [editorScenes, setEditorScenes] = useState<DerivedSceneNav[]>([]);
  const [caretActiveSceneKey, setCaretActiveSceneKey] = useState<string | null>(null);
  const [mountedEditor, setMountedEditor] = useState<LexicalEditor | null>(null);
  const [editorWritingFocused, setEditorWritingFocused] = useState(false);
  const [estimatedPages, setEstimatedPages] = useState(
    estimateScreenplayPageCount(initialSeed.blocks),
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPhase, setExportPhase] = useState<ExportModalPhase>("ready");
  const [exportLayoutPages, setExportLayoutPages] = useState(estimatedPages);
  const exportDownloadUrlRef = useRef<string | null>(null);
  const [editorAutosaveEnabled] = useState(initialEditorAutosaveEnabled);

  useEffect(() => {
    editorAutosaveEnabledRef.current = editorAutosaveEnabled;
  }, [editorAutosaveEnabled]);
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
  const [isMobileEditorLayout, setIsMobileEditorLayout] = useState(false);
  const [mobileEditorHelpExpanded, setMobileEditorHelpExpanded] = useState(false);
  const tipsHoverEnabled = tipsEnabled && tipsDetailLevel === "full";
  const tipsContextStripEnabled = tipsEnabled && tipsDetailLevel === "full";

  useLayoutEffect(() => {
    if (prototypeMode) {
      return;
    }
    const overlay = readPreferenceOverlay(userId);
    if (typeof overlay.editorTipsEnabled === "boolean") {
      setTipsEnabled(overlay.editorTipsEnabled);
    }
    if (overlay.editorTipsDetailLevel === "full" || overlay.editorTipsDetailLevel === "minimal") {
      setTipsDetailLevel(overlay.editorTipsDetailLevel);
    }
  }, [prototypeMode, userId]);

  useEffect(() => {
    function closeEditorOverlays() {
      setLeaveTargetHref(null);
      setLeaveModalError(null);
      setIsLeaveSaving(false);
      setIsExportModalOpen(false);
      setExportPhase("ready");
      setIsGlossaryOpen(false);
      if (exportDownloadUrlRef.current) {
        URL.revokeObjectURL(exportDownloadUrlRef.current);
        exportDownloadUrlRef.current = null;
      }
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        closeEditorOverlays();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (exportDownloadUrlRef.current) {
        URL.revokeObjectURL(exportDownloadUrlRef.current);
        exportDownloadUrlRef.current = null;
      }
    };
  }, []);

  const handleScenesPanelVisibleChange = useCallback((next: SetStateAction<boolean>) => {
    autoCollapsedSidebarRef.current = false;
    setIsScenesPanelVisible(next);
  }, []);

  const handleDataPanelVisibleChange = useCallback((next: SetStateAction<boolean>) => {
    autoCollapsedSidebarRef.current = false;
    setIsDataPanelVisible(next);
  }, []);

  const openScenesPanel = useCallback(() => {
    autoCollapsedSidebarRef.current = false;
    setIsScenesPanelVisible(true);
  }, []);

  const openDataPanel = useCallback(() => {
    autoCollapsedSidebarRef.current = false;
    setIsDataPanelVisible(true);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SCENE_PANEL_SIDE_STORAGE_KEY);
      if (raw === "left" || raw === "right") {
        setScenePanelSide(raw);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCENE_PANEL_SIDE_STORAGE_KEY, scenePanelSide);
    } catch {
      // ignore
    }
  }, [scenePanelSide]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_EDITOR_MEDIA_QUERY);

    function syncSidebarVisibility(matches: boolean) {
      setIsMobileEditorLayout(matches);
      if (!matches) {
        setMobileEditorHelpExpanded(false);
      }

      if (matches) {
        setIsScenesPanelVisible((current) => {
          if (current) {
            autoCollapsedSidebarRef.current = true;
          }
          return false;
        });
        setIsDataPanelVisible((current) => {
          if (current) {
            autoCollapsedSidebarRef.current = true;
          }
          return false;
        });
        return;
      }

      if (autoCollapsedSidebarRef.current) {
        autoCollapsedSidebarRef.current = false;
        setIsScenesPanelVisible(true);
        setIsDataPanelVisible(true);
      }
    }

    syncSidebarVisibility(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => {
      syncSidebarVisibility(event.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (prototypeMode || typeof navigator === "undefined" || !navigator.onLine) {
      return undefined;
    }

    function flushOverlay() {
      void (async () => {
        const auth = await getSupabaseBrowserClientWithUser();
        if (!auth.ok || auth.user.id !== userId) {
          return;
        }
        if (Object.keys(readPreferenceOverlay(userId)).length === 0) {
          return;
        }
        await flushPreferenceOverlayToServer(auth.supabase, userId);
      })();
    }

    flushOverlay();
    window.addEventListener("online", flushOverlay);
    return () => {
      window.removeEventListener("online", flushOverlay);
    };
  }, [prototypeMode, userId]);

  const [contextHint, setContextHint] = useState<string | null>(null);
  const [formatAutoMessage, setFormatAutoMessage] = useState<string | null>(null);
  const [activeBlockType, setActiveBlockType] = useState<ScreenplayBlockType>("action");
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [editorBlocks, setEditorBlocks] = useState<readonly SerializedEditorBlock[]>(
    initialSeed.blocks,
  );
  const [editorSeedBlocks, setEditorSeedBlocks] = useState<readonly SerializedEditorBlock[]>(
    initialSeed.blocks,
  );

  useEffect(() => {
    if (!isExportModalOpen) {
      return;
    }
    const editor = lexicalEditorRef.current;
    if (!editor) {
      setExportLayoutPages(estimatedPages);
      return;
    }
    const blocks = serializeScreenplayBlocks(editor.getEditorState());
    setExportLayoutPages(Math.max(1, layoutScreenplayForExport(blocks).length));
  }, [editorBlocks, estimatedPages, isExportModalOpen]);
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

  const scriptStats = useMemo(() => computeEditorScriptStats(editorBlocks), [editorBlocks]);

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
    const nextSignature = persistComparisonSignature(projectTitleRef.current, editorBlocksRef.current);
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

    const persistRetryDelaysMs = [700, 1900] as const;
    let snapshotResult: Awaited<ReturnType<typeof saveProjectSnapshot>> | null = null;

    const authClient = await getSupabaseBrowserClientWithUser();
    if (!authClient.ok) {
      if (savingIndicatorDelayRef.current !== null) {
        window.clearTimeout(savingIndicatorDelayRef.current);
        savingIndicatorDelayRef.current = null;
      }
      isSavingRef.current = false;
      setPersistState("error");
      setPersistErrorMessage(
        "Tu sesión no está activa. Recargá la página o volvé a iniciar sesión e intentá guardar de nuevo.",
      );
      queuedPersistRef.current = false;
      return false;
    }
    let supabase = authClient.supabase;

    attemptLoop: for (let attempt = 0; attempt < 1 + persistRetryDelaysMs.length; attempt++) {
      if (attempt > 0) {
        const waitMs = persistRetryDelaysMs[attempt - 1]!;
        await new Promise((resolve) => {
          window.setTimeout(resolve, waitMs);
        });
        if (isOfflineRef.current) {
          setPersistState("local-draft");
          setPersistErrorMessage(null);
          if (savingIndicatorDelayRef.current !== null) {
            window.clearTimeout(savingIndicatorDelayRef.current);
            savingIndicatorDelayRef.current = null;
          }
          isSavingRef.current = false;
          queuedPersistRef.current = false;
          return false;
        }
        const again = await getSupabaseBrowserClientWithUser();
        if (again.ok) {
          supabase = again.supabase;
        }
      }

      snapshotResult = await saveProjectSnapshot(supabase, {
        blocks: editorBlocksRef.current,
        documentId: documentIdRef.current,
        project: projectRecordRef.current ?? currentProject,
        title: normalizeEditableProjectTitle(projectTitleRef.current),
      });

      if (!snapshotResult.error && snapshotResult.data) {
        break attemptLoop;
      }

      const canRetry =
        attempt < persistRetryDelaysMs.length &&
        isLikelyTransientPersistError(snapshotResult.error) &&
        !isOfflineRef.current;

      if (!canRetry) {
        break attemptLoop;
      }
    }

    if (savingIndicatorDelayRef.current !== null) {
      window.clearTimeout(savingIndicatorDelayRef.current);
      savingIndicatorDelayRef.current = null;
    }

    isSavingRef.current = false;

    const result = snapshotResult!;

    if (result.error || !result.data) {
      setPersistState("error");
      setPersistErrorMessage(result.error?.message ?? "No se pudo sincronizar el documento.");
      queuedPersistRef.current = false;
      return false;
    }

    lastPersistedSignatureRef.current = persistComparisonSignature(
      result.data.project.title,
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
      const latestSignature = persistComparisonSignature(
        projectTitleRef.current,
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
    [
      prototypeMode,
      queuePrototypeSaveConfirmation,
      syncFromEditorState,
      tipsDetailLevel,
      tipsEnabled,
    ],
  );

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
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok || auth.user.id !== userId) {
        setTipsPreferenceFeedback({
          tone: "error",
          message: "Iniciá sesión de nuevo para guardar esta preferencia.",
        });
        return;
      }

      const { appliedLocallyOnly, error } = await mergeUserProfilePreferencesResilient(
        auth.supabase,
        userId,
        {
          editorTipsEnabled: false,
        },
      );

      if (error) {
        setTipsPreferenceFeedback({
          tone: "error",
          message: "No pudimos guardar esta preferencia. Probá de nuevo en unos segundos.",
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
        message: appliedLocallyOnly
          ? offlinePreferenceSuccessMessage()
          : "Ayudas desactivadas. Podés volver a activarlas en Ajustes → Editor.",
      });
    } catch {
      setTipsPreferenceFeedback({
        tone: "error",
        message: "No pudimos guardar esta preferencia. Probá de nuevo en unos segundos.",
      });
    } finally {
      setIsTipsPreferenceSaving(false);
    }
  }, [isTipsPreferenceSaving, userId]);

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
    if (!isScenesPanelVisible || !displayActiveSceneKey) {
      return;
    }

    const button = activeSceneNavButtonRef.current;
    button?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [displayActiveSceneKey, isScenesPanelVisible]);

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
    if (prototypeMode) {
      return undefined;
    }

    function scheduleReconnectPersist(): void {
      if (onlineReconnectPersistTimeoutRef.current !== null) {
        window.clearTimeout(onlineReconnectPersistTimeoutRef.current);
      }
      onlineReconnectPersistTimeoutRef.current = window.setTimeout(() => {
        onlineReconnectPersistTimeoutRef.current = null;
        if (!editorAutosaveEnabledRef.current || !projectRecordRef.current) {
          return;
        }
        if (!navigator.onLine) {
          return;
        }
        const nextSignature = persistComparisonSignature(projectTitleRef.current, editorBlocksRef.current);
        if (nextSignature === lastPersistedSignatureRef.current) {
          return;
        }
        void persistLatestDraftRef.current();
      }, 520);
    }

    function onBrowserOnline(): void {
      scheduleReconnectPersist();
    }

    window.addEventListener("online", onBrowserOnline);
    return () => {
      window.removeEventListener("online", onBrowserOnline);
      if (onlineReconnectPersistTimeoutRef.current !== null) {
        window.clearTimeout(onlineReconnectPersistTimeoutRef.current);
        onlineReconnectPersistTimeoutRef.current = null;
      }
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
    const nextSignature = persistComparisonSignature(projectTitle, editorBlocks);
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
    } else {
      setPersistState((previous) => (previous === "local-draft" ? "saved" : previous));
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

      if (onlineReconnectPersistTimeoutRef.current !== null) {
        window.clearTimeout(onlineReconnectPersistTimeoutRef.current);
      }
    };
  }, []);

  const handleExportPdf = useCallback(async () => {
    const editor = lexicalEditorRef.current;
    if (!editor) {
      setExportPhase("error");
      return;
    }

    setExportPhase("exporting");

    try {
      const blocks = serializeScreenplayBlocks(editor.getEditorState());
      const bytes = await buildScreenplayPdfFromBlocks(blocks);
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (exportDownloadUrlRef.current) {
        URL.revokeObjectURL(exportDownloadUrlRef.current);
      }
      exportDownloadUrlRef.current = url;
      setExportPhase("success");

      const fileStem = sanitizeExportFileName(
        normalizeEditableProjectTitle(projectTitleRef.current),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${fileStem}.pdf`;
      anchor.rel = "noopener";
      anchor.click();
    } catch {
      setExportPhase("error");
    }
  }, []);

  const handleExportDownloadAgain = useCallback(() => {
    const url = exportDownloadUrlRef.current;
    if (!url) {
      return;
    }
    const fileStem = sanitizeExportFileName(normalizeEditableProjectTitle(projectTitleRef.current));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileStem}.pdf`;
    anchor.rel = "noopener";
    anchor.click();
  }, []);

  function handleOpenExportModal() {
    if (exportDownloadUrlRef.current) {
      URL.revokeObjectURL(exportDownloadUrlRef.current);
      exportDownloadUrlRef.current = null;
    }
    setExportPhase("ready");
    setIsExportModalOpen(true);
  }

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
    isOffline: prototypeMode
      ? viewState === "offline"
      : isBrowserOffline || viewState === "offline",
    persistState,
    prototypeMode,
    prototypeSaveState,
    viewState,
  });
  const isOffline = prototypeMode
    ? viewState === "offline"
    : isBrowserOffline || viewState === "offline";
  const activeEditorScene =
    editorScenes.find((scene) => scene.id === displayActiveSceneKey) ?? null;
  const exportAuthor = projectRecord?.author ?? initialSeed.author ?? previewUser.name;
  const blockTypeGlossaryEntry = getGlossaryEntryForBlockType(activeBlockType);
  const pageMinuteGlossaryEntry = getGlossaryEntryById("page-minute");
  const hasContextHint =
    tipsContextStripEnabled && (formatAutoMessage != null || contextHint != null);
  const hasHelpBarLeading = tipsContextStripEnabled;
  const showMobileHelpCollapsed =
    tipsEnabled && isMobileEditorLayout && !mobileEditorHelpExpanded;

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

  const scenesSidebarBody =
    editorScenes.length === 0 ? (
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
    );

  const scenesHeaderPlain = (
    <EditorPanelVisibilityEye
      isOpen={isScenesPanelVisible}
      panel="scenes"
      onToggle={() => handleScenesPanelVisibleChange((v) => !v)}
    />
  );

  const scenesPanelEl = (
    <DraggableScenesPanel
      dragHandle={<GripVertical size={18} strokeWidth={2} aria-hidden />}
      dragHandleLabel="Arrastrar el panel de escenas al otro lateral"
      headerTrailing={scenesHeaderPlain}
      body={<div className={styles.editorSidebarBody}>{scenesSidebarBody}</div>}
    />
  );

  const scriptMetaAside = (
    <DraggableScriptMetaPanel
      dragHandle={<GripVertical size={18} strokeWidth={2} aria-hidden />}
      dragHandleLabel="Arrastrar datos del guion al otro lateral"
      headerTrailing={
        <>
          <p className={cn("foundation-kicker", styles.editorSidebarTitleWrap)}>Datos del guion</p>
          <EditorPanelVisibilityEye
            isOpen={isDataPanelVisible}
            panel="data"
            onToggle={() => handleDataPanelVisibleChange((v) => !v)}
          />
        </>
      }
      body={
        <div className={styles.editorMetaSidebarBody}>
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
              <span>Páginas (aprox.)</span>
              <strong>~{estimatedPages}</strong>
            </div>
            <div className={styles.modalSummaryRow}>
              <span>Escena activa</span>
              <strong>{activeEditorScene ? activeEditorScene.indexLabel : "—"}</strong>
            </div>
            <div className={styles.modalSummaryRow}>
              <span>Bloque activo</span>
              <strong>{BLOCK_TYPE_LABEL_ES[activeBlockType]}</strong>
            </div>
          </div>
        </div>
      }
    />
  );

  const leftPanelCollapsed =
    scenePanelSide === "left" ? !isScenesPanelVisible : !isDataPanelVisible;
  const rightPanelCollapsed =
    scenePanelSide === "right" ? !isScenesPanelVisible : !isDataPanelVisible;

  const leftWorkspaceCell =
    scenePanelSide === "left" ? (
      isScenesPanelVisible ? (
        scenesPanelEl
      ) : (
        <EditorSidePanelCollapsedStrip panel="scenes" onExpand={openScenesPanel} />
      )
    ) : isDataPanelVisible ? (
      scriptMetaAside
    ) : (
      <EditorSidePanelCollapsedStrip panel="data" onExpand={openDataPanel} />
    );

  const rightWorkspaceCell =
    scenePanelSide === "right" ? (
      isScenesPanelVisible ? (
        scenesPanelEl
      ) : (
        <EditorSidePanelCollapsedStrip panel="scenes" onExpand={openScenesPanel} />
      )
    ) : isDataPanelVisible ? (
      scriptMetaAside
    ) : (
      <EditorSidePanelCollapsedStrip panel="data" onExpand={openDataPanel} />
    );

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
            <div className={styles.editorHeaderIdentity}>
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
              <div className={styles.editorTitleRow}>
                <input
                  type="text"
                  className={styles.editorTitleInput}
                  aria-label="Título del proyecto"
                  value={projectTitle}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  onBlur={handleTitleBlur}
                />
                <span
                  className={styles.visuallyHidden}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {status.label}
                </span>
                <HoverDelayTip
                  className={styles.editorSaveStatusTipWrap}
                  content={<SaveStatusTooltipBody label={status.label} detail={status.detail} />}
                  delayMs={560}
                >
                  <button
                    type="button"
                    className={cn(styles.editorSaveStatusTrigger, getStatusClassName(status.tone))}
                    aria-label={status.label}
                  >
                    <SaveStatusGlyph kind={status.icon} />
                  </button>
                </HoverDelayTip>
              </div>
            </div>
          </div>

          <div className={styles.editorHeaderTrailing}>
            <div className={styles.editorHeaderFileCluster}>
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
        </div>

        {tipsEnabled ? (
          showMobileHelpCollapsed ? (
            <div className={styles.editorHelpMobileCollapsed}>
              <button
                type="button"
                className={styles.editorHelpMobileExpandButton}
                aria-expanded={false}
                onClick={() => setMobileEditorHelpExpanded(true)}
              >
                Ayudas del editor
              </button>
            </div>
          ) : (
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
                  {isMobileEditorLayout ? (
                    <button
                      type="button"
                      className={styles.editorHelpCollapseLink}
                      onClick={() => setMobileEditorHelpExpanded(false)}
                    >
                      Contraer
                    </button>
                  ) : null}
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
          )
        ) : null}
      </header>

      <div
        className={cn(
          styles.editorWorkspace,
          !isMobileEditorLayout && styles.editorWorkspaceTriple,
          isMobileEditorLayout && styles.editorWorkspaceSceneCollapsed,
        )}
      >
        {!isMobileEditorLayout ? (
          <EditorWorkspaceDnd
            onScenePanelSideChange={setScenePanelSide}
            scenePanelSide={scenePanelSide}
          >
            <div className={styles.editorWorkspaceTripleInner}>
              <DroppableEditorSide
                droppableId={EDITOR_DROP_LEFT}
                slotLayout={leftPanelCollapsed ? "collapse-start" : "fill"}
              >
                {leftWorkspaceCell}
              </DroppableEditorSide>
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
              <DroppableEditorSide
                droppableId={EDITOR_DROP_RIGHT}
                slotLayout={rightPanelCollapsed ? "collapse-end" : "fill"}
              >
                {rightWorkspaceCell}
              </DroppableEditorSide>
            </div>
          </EditorWorkspaceDnd>
        ) : (
          <>
            <div
              className={styles.editorWorkspaceMobilePanelBar}
              role="group"
              aria-label="Mostrar u ocultar paneles del editor"
            >
              <EditorPanelVisibilityEye
                compact
                isOpen={isScenesPanelVisible}
                panel="scenes"
                onToggle={() => handleScenesPanelVisibleChange((v) => !v)}
              />
              <EditorPanelVisibilityEye
                compact
                isOpen={isDataPanelVisible}
                panel="data"
                onToggle={() => handleDataPanelVisibleChange((v) => !v)}
              />
            </div>
            {isScenesPanelVisible ? (
              <aside className={styles.editorSidebar} aria-label="Sidebar de escenas">
                <div className={styles.editorSidebarHeader}>{scenesHeaderPlain}</div>
                <div className={styles.editorSidebarBody}>{scenesSidebarBody}</div>
              </aside>
            ) : null}
            {isDataPanelVisible ? scriptMetaAside : null}
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
          </>
        )}
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
        <div className={styles.editorFooterMeta} aria-label="Estadísticas del guion">
          <span>
            {SCRIPT_STATS_NUMBER_FORMAT.format(scriptStats.words)}{" "}
            {scriptStats.words === 1 ? "palabra" : "palabras"}
          </span>
          <span className={styles.editorFooterStatSep} aria-hidden>
            ·
          </span>
          <span>
            {SCRIPT_STATS_NUMBER_FORMAT.format(scriptStats.characters)}{" "}
            {scriptStats.characters === 1 ? "carácter" : "caracteres"}
          </span>
          <span className={styles.editorFooterStatSep} aria-hidden>
            ·
          </span>
          <span>
            {SCRIPT_STATS_NUMBER_FORMAT.format(scriptStats.letters)}{" "}
            {scriptStats.letters === 1 ? "letra" : "letras"}
          </span>
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
            <Button
              variant="ghost"
              disabled={isLeaveSaving}
              onClick={() => handleLeaveWithoutSaving()}
            >
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
        onOpenChange={(open) => {
          if (!open) {
            if (exportDownloadUrlRef.current) {
              URL.revokeObjectURL(exportDownloadUrlRef.current);
              exportDownloadUrlRef.current = null;
            }
            setExportPhase("ready");
          }
          setIsExportModalOpen(open);
        }}
        title="Exportar guion"
        closeLabel="Cerrar modal"
        footer={
          exportPhase === "success" ? (
            <>
              <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
                Cerrar
              </Button>
              <Button variant="primary" onClick={handleExportDownloadAgain}>
                Descargar PDF
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={exportPhase === "exporting"}
                onClick={() => void handleExportPdf()}
              >
                {exportPhase === "error"
                  ? "Reintentar"
                  : exportPhase === "exporting"
                    ? "Exportando…"
                    : "Exportar PDF"}
              </Button>
            </>
          )
        }
      >
        <div className={styles.modalSection}>
          {exportPhase === "success" ? (
            <p className={cn(styles.modalMessage, styles.modalMessageSuccess)}>
              PDF listo. Si la descarga no empezó automáticamente, usá «Descargar PDF».
            </p>
          ) : exportPhase === "error" ? (
            <p className={cn(styles.modalMessage, styles.modalMessageError)} role="alert">
              No se pudo generar el PDF. Intentá de nuevo.
            </p>
          ) : null}

          {exportPhase !== "success" ? (
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
                <span>Páginas (layout)</span>
                <strong>{exportLayoutPages}</strong>
              </div>
            </div>
          ) : null}

          {exportPhase === "ready" ? (
            <p className={styles.modalHint}>
              Se exporta el texto tal como está en el editor (misma rejilla A4 que el PDF).
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
