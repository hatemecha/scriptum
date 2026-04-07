import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./workspace-screen.module.css";

type StatePanelProps = {
  actions?: ReactNode;
  description: string;
  eyebrow?: string;
  secondaryDescription?: string;
  title: string;
  tone?: "danger" | "default";
};

export function StatePanel({
  actions,
  description,
  eyebrow,
  secondaryDescription,
  title,
  tone = "default",
}: StatePanelProps) {
  return (
    <section className={cn(styles.statePanel, tone === "danger" && styles.statePanelDanger)}>
      <div className={styles.statePanelCopy}>
        {eyebrow ? <p className={styles.statePanelEyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.statePanelTitle}>{title}</h1>
        <p className={styles.statePanelDescription}>{description}</p>
        {secondaryDescription ? (
          <p className={styles.statePanelDescription}>{secondaryDescription}</p>
        ) : null}
      </div>

      {actions ? <div className={styles.statePanelActions}>{actions}</div> : null}
    </section>
  );
}
