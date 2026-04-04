import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { previewProjects } from "@/features/product/preview-data";
import { type ProjectsViewState } from "@/features/product/view-states";

import { StatePanel } from "./state-panel";
import styles from "./workspace-screen.module.css";

type ProjectsScreenProps = {
  viewState: ProjectsViewState;
};

function CreateProjectAction({ disabled }: { disabled: boolean }) {
  if (disabled) {
    return (
      <button
        type="button"
        className="ui-button"
        data-size="md"
        data-variant="primary"
        disabled
        title="Necesitas conexion para crear un proyecto."
      >
        + Nuevo proyecto
      </button>
    );
  }

  return (
    <Link
      href={`${routes.projectEditor("sin-titulo")}?state=empty`}
      className="ui-button"
      data-size="md"
      data-variant="primary"
    >
      + Nuevo proyecto
    </Link>
  );
}

function ProjectsLoadingState() {
  return (
    <div className={styles.skeletonList} aria-label="Cargando proyectos">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={`project-skeleton-${index}`} className={styles.skeletonRow}>
          <div className={styles.skeletonRowMain}>
            <Skeleton height="1rem" width="42%" radius="999px" />
            <Skeleton height="0.9rem" width="74%" radius="999px" />
          </div>
          <Skeleton height="0.9rem" width="6.5rem" radius="999px" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsScreen({ viewState }: ProjectsScreenProps) {
  const isOffline = viewState === "offline";

  if (viewState === "error") {
    return (
      <StatePanel
        eyebrow="Authenticated / Projects"
        title="Algo salio mal"
        description="No pudimos cargar tus proyectos."
        secondaryDescription="Intenta recargar o vuelve al inicio."
        tone="danger"
        actions={
          <>
            <Link
              href={routes.projects}
              className="ui-button"
              data-size="md"
              data-variant="primary"
            >
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
    <section className={styles.pageSection}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <p className="section-eyebrow">Dashboard / Proyectos</p>
          <h1 className={styles.pageTitle}>Tus proyectos</h1>
          <p className={styles.pageDescription}>
            Abre el ultimo borrador en segundos o crea un proyecto nuevo sin pasos extra.
          </p>
        </div>

        <div className={styles.pageActions}>
          <CreateProjectAction disabled={isOffline} />
        </div>
      </header>

      {isOffline ? (
        <p className={styles.inlineNotice}>
          Sin conexion. Mostrando la ultima version disponible y pausando la creacion de proyectos.
        </p>
      ) : null}

      {viewState === "loading" ? (
        <ProjectsLoadingState />
      ) : viewState === "empty" ? (
        <StatePanel
          eyebrow="Projects / Empty"
          title="Todavia no tienes proyectos"
          description="Crea tu primer guion para empezar."
          actions={<CreateProjectAction disabled={false} />}
        />
      ) : (
        <div className={styles.projectList}>
          {previewProjects.map((project) => (
            <Link
              key={project.id}
              href={routes.projectEditor(project.id)}
              className={styles.projectRow}
            >
              <div className={styles.projectRowMain}>
                <h2 className={styles.projectRowTitle}>{project.title}</h2>
                <p className={styles.projectRowMeta}>
                  {project.author ? `Autor: ${project.author}` : "Autor: Sin definir"}
                </p>
                <p className={styles.projectRowSummary}>{project.summary}</p>
              </div>

              <span className={styles.projectRowTime}>Editado {project.lastEditedLabel}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
