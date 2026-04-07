import Link from "next/link";

import { routes } from "@/config/routes";
import {
  getPreviewLines,
  getPreviewProject,
  getPreviewScenes,
} from "@/features/product/preview-data";

import { LandingPreviewPaper } from "./landing-preview-paper";
import styles from "./landing-page.module.css";

const highlights = [
  {
    description:
      "Te ocupas de la historia; nosotros de sangrías, mayúsculas y ritmo visual. Sin plantillas rígidas ni menús eternos.",
    title: "Formato de estudio",
  },
  {
    description:
      "Un clic y tenés un PDF presentable para leer, compartir o enviar. Nada de retoques manuales antes de la lectura.",
    title: "PDF listo",
  },
  {
    description:
      "Menos paneles, más páginas. Pensado para escribir con el teclado y no perder el hilo.",
    title: "Flujo limpio",
  },
] as const;

export function LandingPage() {
  const project = getPreviewProject("the-silent-editor");
  const scenes = getPreviewScenes(project.blocks).slice(0, 3);
  const lines = getPreviewLines(project.blocks).slice(0, 6);

  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>Editor de guion cinematográfico</p>
          <h1 className={styles.headline}>
            Tu guion cinematográfico, con formato profesional desde el inicio.
          </h1>
          <p className={styles.subheadline}>
            Abrí un proyecto y empeza a escribir. 
            Sin suites recargadas ni curva de aprendizaje absurda.
          </p>
          <div className={styles.actions}>
            <Link
              href={routes.register}
              className="ui-button"
              data-size="lg"
              data-variant="primary"
            >
              Empezar gratis
            </Link>
            <Link
              href={routes.login}
              className="ui-button"
              data-size="lg"
              data-variant="secondary"
            >
              Iniciar sesión
            </Link>
          </div>
          <p className={styles.heroProof} aria-hidden="true">
            <span>Personalizable</span>
            <span className={styles.heroProofDot} />
            <span>Profesional</span>
            <span className={styles.heroProofDot} />
            <span>Exportación PDF</span>
          </p>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={`${styles.mockupCard} ${styles.mockupMain}`}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDot} />
              <div className={styles.mockupDot} />
              <div className={styles.mockupDot} />
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupLine} style={{ width: '40%', margin: '0 auto', marginBottom: '1rem' }} />
              <div className={styles.mockupLine} style={{ width: '80%' }} />
              <div className={styles.mockupLine} style={{ width: '75%' }} />
              <div className={styles.mockupLine} style={{ width: '85%', marginBottom: '1.25rem' }} />
              <div className={styles.mockupLine} style={{ width: '30%', margin: '0 auto' }} />
              <div className={styles.mockupLine} style={{ width: '50%', margin: '0 auto' }} />
              <div className={styles.mockupLine} style={{ width: '45%', margin: '0 auto' }} />
            </div>
          </div>
          <div className={`${styles.mockupCard} ${styles.mockupSecondary}`}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupLine} style={{ width: '35%' }} />
            </div>
            <div className={styles.mockupSidebar}>
              <div className={styles.mockupLine} style={{ width: '85%' }} />
              <div className={styles.mockupLine} style={{ width: '60%' }} />
              <div className={styles.mockupLine} style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.preview} aria-labelledby="preview-heading">
        <div className={styles.previewLead}>
          <div>
            <p className={styles.kicker}>Así se ve adentro</p>
            <h2 id="preview-heading" className={styles.sectionTitle}>
              La escritura como prioridad. El resto, en segundo plano.
            </h2>
            <p className={styles.previewLeadCopy}>
              Escribí en un formato profesional y claro sin distracciones o interfaces raras.
            </p>
          </div>
        </div>

        <div className={styles.previewGrid}>
          <aside className={`${styles.sceneColumn} foundation-scene-column`} aria-label="Escenas">
            <ol className="foundation-scene-list">
              {scenes.map((scene, index) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="foundation-scene-item"
                    data-active={index === 0 ? "true" : "false"}
                    aria-current={index === 0 ? "true" : undefined}
                  >
                    <span className="foundation-scene-item__index">{scene.indexLabel}</span>
                    <span className="foundation-scene-item__title">{scene.heading}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className={styles.sceneMeta}>
              <span>Guardado</span>
              <span>~{project.estimatedPages} páginas</span>
            </div>
          </aside>

          <div className={styles.scriptStage}>
            <LandingPreviewPaper lines={lines} />
          </div>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="values-heading">
        <div className={styles.valuesIntro}>
          <p className={styles.kicker}>Por qué elegir Scriptum</p>
          <h2 id="values-heading" className={styles.sectionTitle}>
            Menos fricción. Más páginas que valgan la pena.
          </h2>
        </div>
        <ul className={styles.valueList}>
          {highlights.map((item) => (
            <li key={item.title} className={styles.valueItem}>
              <h3 className={styles.valueTitle}>{item.title}</h3>
              <p className={styles.valueDescription}>{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.closing} aria-label="Llamada a la accion">
        <div className={styles.closingInner}>
          <h2 className={styles.closingTitle}>¿Listo para tu próximo borrador?</h2>
          <p className={styles.closingCopy}>
            Creá tu cuenta gratis y entra al editor en minutos. Sin tarjeta para empezar.
          </p>
          <div className={styles.closingActions}>
            <Link
              href={routes.register}
              className="ui-button"
              data-size="lg"
              data-variant="primary"
            >
              Crear cuenta
            </Link>
            <Link href={routes.login} className={styles.closingLink}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>&copy; 2026 SCRIPTUM</footer>
    </div>
  );
}
