"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AppBoneyardSkeleton } from "@/components/ui/boneyard-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { type ProjectsViewState } from "@/features/product/view-states";
import {
  archiveProject,
  createProject,
  deleteProject,
  formatProjectLastEditedLabel,
  formatProjectStatusLabel,
  renameProject,
  unarchiveProject,
  updateProjectMetadata,
  type UserProject,
} from "@/features/projects/projects";
import { getSupabaseBrowserClientWithUser } from "@/lib/supabase/client";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type ProjectsScreenProps = {
  projects: UserProject[];
  viewState: ProjectsViewState;
};

type ProjectFilter = "all" | "active" | "archived";

function getFilteredProjects(projects: UserProject[], filter: ProjectFilter): UserProject[] {
  switch (filter) {
    case "active":
      return projects.filter((p) => p.archivedAt === null);
    case "archived":
      return projects.filter((p) => p.archivedAt !== null);
    default:
      return projects;
  }
}

function ProjectsLoadingFixture() {
  return (
    <div className={styles.projectList} aria-hidden="true">
      {[
        {
          meta: "Borrador · 9 escenas",
          summary: "La escaleta ya está armada y queda revisar el clímax.",
          time: "Hace 5 min",
          title: "El editor silencioso",
        },
        {
          meta: "Tratamiento · 4 escenas",
          summary: "Revisión de tono y presentación para el productor.",
          time: "Ayer",
          title: "Ciudad de papel",
        },
        {
          meta: "Outline · 12 escenas",
          summary: "Ideas sueltas sobre la investigación y el giro final.",
          time: "Hace 3 días",
          title: "La última toma",
        },
      ].map((project) => (
        <article key={project.title} className={styles.projectRow}>
          <div className={styles.projectRowLink}>
            <div className={styles.projectRowMain}>
              <p className={styles.projectRowTitle}>{project.title}</p>
              <p className={styles.projectRowMeta}>{project.meta}</p>
              <p className={styles.projectRowSummary}>{project.summary}</p>
            </div>
            <span className={styles.projectRowTime}>{project.time}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectsLoadingFallback() {
  return (
    <div className={styles.skeletonList} aria-label="Cargando proyectos">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`project-skeleton-${index}`} className={styles.skeletonRow}>
          <div className={styles.skeletonRowMain}>
            <div className="ui-skeleton" style={{ borderRadius: "999px", height: "1rem", width: "42%" }} />
            <div className="ui-skeleton" style={{ borderRadius: "999px", height: "0.9rem", width: "74%" }} />
          </div>
          <div className="ui-skeleton" style={{ borderRadius: "999px", height: "0.9rem", width: "6.5rem" }} />
        </div>
      ))}
    </div>
  );
}

function ProjectsLoadingState() {
  return (
    <AppBoneyardSkeleton
      fallback={<ProjectsLoadingFallback />}
      loading={true}
      name="projects-loading-screen"
    >
      <ProjectsLoadingFixture />
    </AppBoneyardSkeleton>
  );
}

// ---------------------------------------------------------------------------
// Action menu
// ---------------------------------------------------------------------------

type ProjectActionsMenuProps = {
  isArchived: boolean;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onEditMetadata: () => void;
  onRename: () => void;
};

function ProjectActionsMenu({
  isArchived,
  onArchiveToggle,
  onDelete,
  onEditMetadata,
  onRename,
}: ProjectActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function act(callback: () => void) {
    setIsOpen(false);
    callback();
  }

  return (
    <div ref={wrapperRef} className={styles.actionsWrapper}>
      <button
        type="button"
        className={styles.actionsToggle}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Opciones del proyecto"
        aria-expanded={isOpen}
      >
        ⋯
      </button>

      {isOpen ? (
        <div className={styles.actionsMenu} role="menu">
          <button
            type="button"
            className={styles.actionsMenuItem}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              act(onRename);
            }}
          >
            Renombrar
          </button>
          <button
            type="button"
            className={styles.actionsMenuItem}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              act(onEditMetadata);
            }}
          >
            Detalles
          </button>
          <button
            type="button"
            className={styles.actionsMenuItem}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              act(onArchiveToggle);
            }}
          >
            {isArchived ? "Desarchivar" : "Archivar"}
          </button>
          <button
            type="button"
            className={`${styles.actionsMenuItem} ${styles.actionsMenuItemDanger}`}
            role="menuitem"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              act(onDelete);
            }}
          >
            Eliminar
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rename modal
// ---------------------------------------------------------------------------

type RenameModalProps = {
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => Promise<void>;
  open: boolean;
};

function RenameModal({ currentTitle, onClose, onConfirm, open }: RenameModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setError(undefined);
    }
  }, [open, currentTitle]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = title.trim();

    if (trimmed.length === 0) {
      setError("El título no puede estar vacío.");
      return;
    }

    setIsSaving(true);

    try {
      await onConfirm(trimmed);
    } catch {
      setError("No se pudo renombrar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal title="Renombrar proyecto" open={open} onOpenChange={() => onClose()}>
      <form onSubmit={handleSubmit}>
        <div className={styles.modalSection}>
          <Input
            name="projectTitle"
            label="Nuevo título"
            value={title}
            error={error}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(undefined);
            }}
            required
            requiredLabel="Obligatorio"
            autoFocus
          />

          <div className={styles.statePanelActions}>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------

type DeleteModalProps = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  open: boolean;
  projectTitle: string;
};

function DeleteModal({ onClose, onConfirm, open, projectTitle }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal title="Eliminar proyecto" open={open} onOpenChange={() => onClose()}>
      <div className={styles.modalSection}>
        <p className={styles.modalMessage}>
          ¿Seguro que quieres eliminar <strong>{projectTitle}</strong>? Esta acción no se puede
          deshacer.
        </p>

        <div className={styles.statePanelActions}>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Metadata modal (title, author, description, status)
// ---------------------------------------------------------------------------

type MetadataModalProps = {
  onClose: () => void;
  onConfirm: (data: { title: string; author: string; description: string }) => Promise<void>;
  open: boolean;
  project: UserProject | null;
};

function MetadataModal({ onClose, onConfirm, open, project }: MetadataModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && project) {
      setTitle(project.title);
      setAuthor(project.author ?? "");
      setDescription(project.description ?? "");
      setError(undefined);
    }
  }, [open, project]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (title.trim().length === 0) {
      setError("El título no puede estar vacío.");
      return;
    }

    setIsSaving(true);

    try {
      await onConfirm({ title: title.trim(), author: author.trim(), description: description.trim() });
    } catch {
      setError("No se pudieron guardar los detalles.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!project) return null;

  const statusLabel = formatProjectStatusLabel(project.status);
  const lastEditedLabel = formatProjectLastEditedLabel(project.lastEditedAt);

  return (
    <Modal
      title="Detalles del proyecto"
      description="Información del guion y metadatos."
      open={open}
      onOpenChange={() => onClose()}
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.modalSection}>
          <Input
            name="metaTitle"
            label="Título del guion"
            value={title}
            error={error}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(undefined);
            }}
            required
            requiredLabel="Obligatorio"
          />

          <Input
            name="metaAuthor"
            label="Autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            hint="Se usará en exportaciones y portada."
          />

          <Input
            name="metaDescription"
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            hint="Breve resumen o nota del proyecto."
          />

          <div className={styles.modalSummary}>
            <div className={styles.modalSummaryRow}>
              <span>Estado</span>
              <strong>{statusLabel}</strong>
            </div>
            <div className={styles.modalSummaryRow}>
              <span>Última edición</span>
              <strong>{lastEditedLabel}</strong>
            </div>
          </div>

          <div className={styles.statePanelActions}>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar detalles"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Project row
// ---------------------------------------------------------------------------

type ProjectRowProps = {
  onArchiveToggle: () => void;
  onDelete: () => void;
  onEditMetadata: () => void;
  onRename: () => void;
  project: UserProject;
};

function ProjectRow({ onArchiveToggle, onDelete, onEditMetadata, onRename, project }: ProjectRowProps) {
  const isArchived = project.archivedAt !== null;

  return (
    <div className={styles.projectRow}>
      <Link href={routes.projectEditor(project.id)} className={styles.projectRowLink}>
        <div className={styles.projectRowMain}>
          <h2 className={styles.projectRowTitle}>
            {project.title}
            {isArchived ? <span className={styles.projectBadge}>Archivado</span> : null}
          </h2>
          <p className={styles.projectRowMeta}>
            {project.author ? `Autor: ${project.author}` : "Autor: Sin definir"}
          </p>
          {project.description ? (
            <p className={styles.projectRowSummary}>{project.description}</p>
          ) : null}
        </div>

        <span className={styles.projectRowTime}>
          Editado {formatProjectLastEditedLabel(project.lastEditedAt)}
        </span>
      </Link>

      <ProjectActionsMenu
        isArchived={isArchived}
        onArchiveToggle={onArchiveToggle}
        onDelete={onDelete}
        onEditMetadata={onEditMetadata}
        onRename={onRename}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function ProjectsScreen({ projects, viewState }: ProjectsScreenProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>("all");

  // Modal state
  const [renameTarget, setRenameTarget] = useState<UserProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProject | null>(null);
  const [metadataTarget, setMetadataTarget] = useState<UserProject | null>(null);

  const isOffline = viewState === "offline";
  const hasArchived = projects.some((p) => p.archivedAt !== null);
  const effectiveFilter = hasArchived ? filter : "all";
  const filtered = getFilteredProjects(projects, effectiveFilter);
  const isEmptyProjectsList =
    viewState !== "loading" && (viewState === "empty" || projects.length === 0);
  const showHeaderCreateButton = viewState !== "loading" && !isEmptyProjectsList;

  async function handleCreateProject() {
    setIsCreating(true);

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok) {
        showToast({ title: "Error", description: "No hay sesión activa.", tone: "error" });
        return;
      }

      const { project, error } = await createProject(auth.supabase, auth.user.id);

      if (error || !project) {
        showToast({
          title: "Error",
          description: "No se pudo crear el proyecto.",
          tone: "error",
        });
        return;
      }

      router.push(routes.projectEditor(project.id));
    } catch {
      showToast({
        title: "Error",
        description: "No se pudo crear el proyecto. Revisa tu conexión.",
        tone: "error",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRename(newTitle: string) {
    if (!renameTarget) return;

    const auth = await getSupabaseBrowserClientWithUser();
    if (!auth.ok) {
      throw auth.error;
    }
    const { error } = await renameProject(auth.supabase, renameTarget.id, newTitle);

    if (error) {
      throw error;
    }

    setRenameTarget(null);
    showToast({ title: "Renombrado", description: "El proyecto se renombró correctamente.", tone: "success" });
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok) {
        showToast({ title: "Error", description: "No hay sesión activa.", tone: "error" });
        return;
      }
      const { error } = await deleteProject(auth.supabase, deleteTarget.id);

      if (error) {
        showToast({ title: "Error", description: "No se pudo eliminar el proyecto.", tone: "error" });
        return;
      }

      setDeleteTarget(null);
      showToast({ title: "Eliminado", description: "El proyecto fue eliminado.", tone: "success" });
      router.refresh();
    } catch {
      showToast({
        title: "Error",
        description: "No se pudo completar la operación. Revisa tu conexión.",
        tone: "error",
      });
    }
  }

  async function handleArchiveToggle(project: UserProject) {
    const isArchived = project.archivedAt !== null;

    try {
      const auth = await getSupabaseBrowserClientWithUser();
      if (!auth.ok) {
        showToast({ title: "Error", description: "No hay sesión activa.", tone: "error" });
        return;
      }

      const { error } = isArchived
        ? await unarchiveProject(auth.supabase, project.id)
        : await archiveProject(auth.supabase, project.id);

      if (error) {
        showToast({
          title: "Error",
          description: isArchived
            ? "No se pudo desarchivar el proyecto."
            : "No se pudo archivar el proyecto.",
          tone: "error",
        });
        return;
      }

      showToast({
        title: isArchived ? "Desarchivado" : "Archivado",
        description: isArchived
          ? "El proyecto volvió a estar activo."
          : "El proyecto fue archivado.",
        tone: "success",
      });
      router.refresh();
    } catch {
      showToast({
        title: "Error",
        description: "No se pudo completar la operación. Revisa tu conexión.",
        tone: "error",
      });
    }
  }

  async function handleMetadataSave(data: { title: string; author: string; description: string }) {
    if (!metadataTarget) return;

    const auth = await getSupabaseBrowserClientWithUser();
    if (!auth.ok) {
      throw auth.error;
    }
    const { error } = await updateProjectMetadata(auth.supabase, metadataTarget.id, {
      title: data.title,
      author: data.author || null,
      description: data.description || null,
    });

    if (error) {
      throw error;
    }

    setMetadataTarget(null);
    showToast({ title: "Guardado", description: "Los detalles del proyecto se actualizaron.", tone: "success" });
    router.refresh();
  }

  if (viewState === "error") {
    return (
      <StatePanel
        title="Algo salió mal"
        description="No pudimos cargar tus proyectos."
        secondaryDescription="Intenta recargar o vuelve al inicio."
        tone="danger"
        actions={
          <>
            <Link href={routes.projects} className="ui-button" data-size="md" data-variant="primary">
              Reintentar
            </Link>
            <Link href={routes.home} className="ui-button" data-size="md" data-variant="secondary">
              Ir al inicio
            </Link>
          </>
        }
      />
    );
  }

  return (
    <>
      <section className={styles.pageSection}>
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderCopy}>
            <h1 className={styles.pageTitle}>Tus proyectos</h1>
          </div>

          {showHeaderCreateButton ? (
            <div className={styles.pageActions}>
              <Button
                variant="primary"
                size="md"
                disabled={isOffline || isCreating}
                onClick={handleCreateProject}
                isLoading={isCreating}
                title={isOffline ? "Necesitas conexión para crear un proyecto." : undefined}
              >
                + Nuevo proyecto
              </Button>
            </div>
          ) : null}
        </header>

        {isOffline ? (
          <p className={styles.inlineNotice}>
            Sin conexión. Última copia en pantalla; crear proyectos en pausa.
          </p>
        ) : null}

        {hasArchived && viewState !== "loading" ? (
          <nav className={styles.filterBar} aria-label="Filtrar proyectos">
            {(["all", "active", "archived"] as const).map((value) => {
              const labels: Record<ProjectFilter, string> = {
                all: "Todos",
                active: "Activos",
                archived: "Archivados",
              };
              return (
                <button
                  key={value}
                  type="button"
                  className={`${styles.filterButton} ${filter === value ? styles.filterButtonActive : ""}`}
                  onClick={() => setFilter(value)}
                >
                  {labels[value]}
                </button>
              );
            })}
          </nav>
        ) : null}

        {viewState === "loading" ? (
          <ProjectsLoadingState />
        ) : isEmptyProjectsList ? (
          <StatePanel
            title="Todavía no tienes proyectos"
            description="Crea tu primer guion para empezar."
            actions={
              <Button
                variant="primary"
                size="md"
                disabled={isOffline || isCreating}
                onClick={handleCreateProject}
                isLoading={isCreating}
                title={isOffline ? "Necesitas conexión para crear un proyecto." : undefined}
              >
                + Nuevo proyecto
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <StatePanel
            title={effectiveFilter === "archived" ? "Sin proyectos archivados" : "Sin proyectos activos"}
            description={
              effectiveFilter === "archived"
                ? "Cuando archives un proyecto, aparecerá aquí."
                : "Todos tus proyectos están archivados."
            }
          />
        ) : (
          <div className={styles.projectList}>
            {filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onRename={() => setRenameTarget(project)}
                onDelete={() => setDeleteTarget(project)}
                onArchiveToggle={() => handleArchiveToggle(project)}
                onEditMetadata={() => setMetadataTarget(project)}
              />
            ))}
          </div>
        )}
      </section>

      <RenameModal
        open={renameTarget !== null}
        currentTitle={renameTarget?.title ?? ""}
        onClose={() => setRenameTarget(null)}
        onConfirm={handleRename}
      />

      <DeleteModal
        open={deleteTarget !== null}
        projectTitle={deleteTarget?.title ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <MetadataModal
        open={metadataTarget !== null}
        project={metadataTarget}
        onClose={() => setMetadataTarget(null)}
        onConfirm={handleMetadataSave}
      />
    </>
  );
}
