import Link from "next/link";

import { siteConfig } from "@/config/site";
import { getScreenplayFoundationValidationSummary } from "@/features/screenplay/foundation-validation";

import styles from "@/app/page.module.css";

const productGuardrails = [
  "Minimal, fast, block-based screenplay editor.",
  "The screenplay rules stay canonical outside the editor runtime.",
  "Visual experiments stay isolated from product routes.",
];

const nextArchitectureSteps = [
  "Define the editor state boundary around the screenplay document.",
  "Introduce editor commands for keyboard, conversion, and paste flows.",
  "Prepare persistence and sync around the canonical document model.",
];

export default function Home() {
  const validationSummary = getScreenplayFoundationValidationSummary();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="section-eyebrow">Phase 2 / Architecture Checkpoint</p>
          <h1 className={styles.title}>{siteConfig.name}</h1>
          <p className={styles.description}>
            The project root now reflects the real state of the product: screenplay
            rules and document structure are validated, while visual exploration lives
            in an internal playground.
          </p>
        </div>

        <div className={styles.heroActions}>
          <span
            className="status-pill"
            data-tone={validationSummary.isValid ? "success" : "info"}
          >
            {validationSummary.isValid
              ? "Foundation validated"
              : `${validationSummary.errorCount} validation issues`}
          </span>

          <Link
            href="/playground/foundation"
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Open visual playground
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <p className="section-eyebrow">Guardrails</p>
          <h2 className={styles.cardTitle}>What stays fixed</h2>
          <ul className={styles.list}>
            {productGuardrails.map((item) => (
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
          <h2 className={styles.cardTitle}>Before the real editor starts</h2>
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
