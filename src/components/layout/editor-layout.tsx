import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";

import styles from "./shells.module.css";

const sceneOutlinePreview = [
  {
    index: "01",
    note: "Derived selector from `Scene Heading` blocks.",
    title: "INT. APARTMENT - NIGHT",
  },
  {
    index: "02",
    note: "Sidebar stays read-only until navigation Day 24.",
    title: "EXT. STREET - MORNING",
  },
  {
    index: "03",
    note: "Focus mode can collapse this rail later.",
    title: "INT. CAFE - AFTERNOON",
  },
];

function formatProjectLabel(projectId: string) {
  const normalizedLabel = projectId
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

  return normalizedLabel || "Untitled Project";
}

type EditorLayoutProps = {
  children: ReactNode;
  projectId: string;
};

export function EditorLayout({ children, projectId }: EditorLayoutProps) {
  const projectLabel = formatProjectLabel(projectId);

  return (
    <div className={styles.editorShell}>
      <header className={styles.editorHeader}>
        <div className={styles.editorHeaderCopy}>
          <p className={styles.layoutEyebrow}>Authenticated / Editor shell</p>
          <h1 className={styles.layoutTitle}>{projectLabel}</h1>
          <p className={styles.layoutDescription}>
            The editor route gets its own workspace shell because writing, navigation, autosave, and
            export feedback all need lower-noise chrome than the rest of the product.
          </p>
        </div>

        <div className={styles.metaStack}>
          <span className={styles.metaChip}>Route-local document session</span>
          <span className={styles.metaChip}>Future autosave indicator</span>
          <Link href={routes.projects} className={styles.utilityLink}>
            Back to projects
          </Link>
        </div>
      </header>

      <div className={styles.editorWorkspace}>
        <aside className={styles.editorSidebar}>
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarLabel}>Scene outline</p>
            <p className={styles.sidebarText}>
              The sidebar reads derived scene data from the document model instead of duplicating
              editor state.
            </p>
          </div>

          <ul className={styles.sceneList}>
            {sceneOutlinePreview.map((scene) => (
              <li key={scene.index} className={styles.sceneItem}>
                <span className={styles.sceneIndex}>Scene {scene.index}</span>
                <span className={styles.sceneTitle}>{scene.title}</span>
                <span className={styles.sceneMeta}>{scene.note}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className={styles.editorMain}>
          <div className={styles.editorContent}>{children}</div>
        </main>
      </div>

      <footer className={styles.editorStatusbar}>
        <div className={styles.statusGroup}>
          <span className={styles.statusDot} />
          <span>Recoverable UI failures stay local to the editor workspace.</span>
        </div>

        <div className={styles.statusGroup}>
          <Link href={routes.settings} className={styles.utilityLink}>
            Settings
          </Link>
          <Link href={routes.home} className={styles.utilityLink}>
            Landing
          </Link>
        </div>
      </footer>
    </div>
  );
}
