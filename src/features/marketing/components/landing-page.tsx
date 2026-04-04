import Link from "next/link";

import { routes } from "@/config/routes";
import {
  getPreviewLines,
  getPreviewProject,
  getPreviewScenes,
} from "@/features/product/preview-data";

import styles from "./landing-page.module.css";

const landingHighlights = [
  {
    description: "Tu guion sigue el estandar sin que tengas que pensar en ello.",
    title: "Formato profesional",
  },
  {
    description: "Descarga tu guion listo para enviar en un solo paso.",
    title: "Exporta a PDF",
  },
  {
    description: "Abre, escribe, exporta. Nada mas.",
    title: "Sin friccion",
  },
] as const;

export function LandingPage() {
  const previewProject = getPreviewProject("the-silent-editor");
  const previewScenes = getPreviewScenes(previewProject.blocks).slice(0, 3);
  const previewLines = getPreviewLines(previewProject.blocks).slice(0, 6);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Paper-first screenplay editor</p>
          <h1 className={styles.title}>Escribe guiones con formato profesional.</h1>
          <p className={styles.description}>
            Un editor limpio para abrir un proyecto, entrar al texto y salir con un PDF listo.
          </p>

          <div className={styles.heroActions}>
            <Link
              href={routes.register}
              className="ui-button"
              data-size="lg"
              data-variant="primary"
            >
              Empezar gratis
            </Link>
            <Link href={routes.login} className="ui-button" data-size="lg" data-variant="secondary">
              Iniciar sesion
            </Link>
          </div>
        </div>

        <div className={styles.heroPreview}>
          <div className={styles.previewSidebar}>
            <div>
              <p className={styles.previewLabel}>Escenas</p>
              <ol className={styles.sceneList}>
                {previewScenes.map((scene, index) => (
                  <li
                    key={scene.id}
                    className={styles.sceneItem}
                    data-active={index === 0 ? "true" : "false"}
                  >
                    <span className={styles.sceneIndex}>{scene.indexLabel}</span>
                    <span className={styles.sceneTitle}>{scene.heading}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.previewMeta}>
              <span>Guardado</span>
              <span>{previewProject.estimatedPages} paginas aprox.</span>
            </div>
          </div>

          <article className={styles.previewPaper}>
            {previewLines.map((line) => (
              <p key={line.id} className={styles.scriptLine} data-line-type={line.type}>
                {line.text}
              </p>
            ))}
          </article>
        </div>
      </section>

      <section className={styles.values}>
        {landingHighlights.map((highlight) => (
          <article key={highlight.title} className={styles.valueCard}>
            <h2 className={styles.valueTitle}>{highlight.title}</h2>
            <p className={styles.valueDescription}>{highlight.description}</p>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>(c) 2026 SCRIPTUM</footer>
    </div>
  );
}
