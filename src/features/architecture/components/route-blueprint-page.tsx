import type { ReactNode } from "react";

import styles from "./route-blueprint-page.module.css";

export type RouteBlueprintSection = {
  description?: string;
  items: string[];
  title: string;
};

type RouteBlueprintAside = {
  items: string[];
  title: string;
};

type RouteBlueprintPageProps = {
  actions?: ReactNode;
  aside?: RouteBlueprintAside;
  description: string;
  eyebrow: string;
  sections: RouteBlueprintSection[];
  status: string;
  title: string;
  tone?: "default" | "error";
};

export function RouteBlueprintPage({
  actions,
  aside,
  description,
  eyebrow,
  sections,
  status,
  title,
  tone = "default",
}: RouteBlueprintPageProps) {
  return (
    <section className={styles.page}>
      <header className={styles.hero} data-tone={tone}>
        <div className={styles.heroCopy}>
          <p className="section-eyebrow">{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.status} data-tone={tone}>
            {status}
          </span>

          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.sections}>
          {sections.map((section) => (
            <article key={section.title} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {section.description ? (
                  <p className={styles.sectionDescription}>{section.description}</p>
                ) : null}
              </div>

              <ul className={styles.list}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {aside ? (
          <aside className={styles.aside}>
            <h2 className={styles.sectionTitle}>{aside.title}</h2>
            <ul className={styles.list}>
              {aside.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
