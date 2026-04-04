import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getScreenplayFoundationValidationSummary } from "@/features/screenplay/foundation-validation";

import styles from "./landing-page.module.css";

const productGuardrails = [
  "Public routes stay thin and mostly presentational.",
  "Authenticated routes split into dashboard chrome and editor chrome.",
  "Feature logic remains under `src/features/*`; App Router files only compose boundaries.",
];

const routeTreeHighlights = [
  "`/` for landing and architecture checkpoint.",
  "`/login` and `/register` inside the public layout.",
  "`/projects` and `/settings` inside the dashboard shell.",
  "`/projects/[projectId]` inside the dedicated editor shell.",
  "`/playground/foundation` isolated as an internal playground route.",
];

const nextArchitectureSteps = [
  "Implement the auth boundary on the authenticated route group.",
  "Start real project queries inside the dashboard shell.",
  "Introduce the editor session state behind the document model.",
];

export function LandingPage() {
  const validationSummary = getScreenplayFoundationValidationSummary();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="section-eyebrow">Phase 2 / Day 8</p>
          <h1 className={styles.title}>{siteConfig.name}</h1>
          <p className={styles.description}>
            The frontend now has a real route tree, public and authenticated layouts, an
            editor-specific shell, and explicit boundaries for state, forms, and UI errors.
          </p>
        </div>

        <div className={styles.heroActions}>
          <span className="status-pill" data-tone={validationSummary.isValid ? "success" : "info"}>
            {validationSummary.isValid
              ? "Foundation validated"
              : `${validationSummary.errorCount} validation issues`}
          </span>

          <div className={styles.actionRow}>
            <Link
              href={routes.projects}
              className="ui-button"
              data-size="md"
              data-variant="primary"
            >
              Preview dashboard shell
            </Link>
            <Link
              href={routes.playgroundFoundation}
              className="ui-button"
              data-size="md"
              data-variant="secondary"
            >
              Open visual playground
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <p className="section-eyebrow">Guardrails</p>
          <h2 className={styles.cardTitle}>What is fixed now</h2>
          <ul className={styles.list}>
            {productGuardrails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <p className="section-eyebrow">Routes</p>
          <h2 className={styles.cardTitle}>App tree at a glance</h2>
          <ul className={styles.list}>
            {routeTreeHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <p className="section-eyebrow">Validation</p>
          <h2 className={styles.cardTitle}>Canonical screenplay foundation</h2>
          <ul className={styles.list}>
            {validationSummary.sections.map((section) => (
              <li key={section.label}>
                <strong>{section.label}:</strong>{" "}
                {section.valid ? "ready" : `${section.errorCount} issues`}
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <p className="section-eyebrow">Next Focus</p>
          <h2 className={styles.cardTitle}>Before implementation Day 9 onward</h2>
          <ul className={styles.list}>
            {nextArchitectureSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
