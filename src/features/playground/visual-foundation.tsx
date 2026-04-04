"use client";

import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import {
  defaultFoundationSceneId,
  foundationChecklist,
  foundationPreviewScenes,
  foundationRailItems,
  foundationToneNotes,
} from "@/features/playground/foundation-preview-data";
import { FoundationIcon } from "@/features/playground/foundation-icons";

export function VisualFoundation() {
  const [activeSceneId, setActiveSceneId] = useState(defaultFoundationSceneId);
  const [exportFileName, setExportFileName] = useState("foundation-preview");
  const [exportFileNameError, setExportFileNameError] = useState<string>();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [demoProjectTitle, setDemoProjectTitle] = useState("The Silent Editor");
  const { showToast } = useToast();

  const activeScene =
    foundationPreviewScenes.find((scene) => scene.id === activeSceneId) ??
    foundationPreviewScenes[0];

  function handleOpenExportModal() {
    setExportFileName(activeScene?.id ?? "foundation-preview");
    setExportFileNameError(undefined);
    setIsExportModalOpen(true);
  }

  function handleQueueExport() {
    const trimmedExportFileName = exportFileName.trim();

    if (trimmedExportFileName.length === 0) {
      setExportFileNameError("Export file name is required.");

      showToast({
        description: "The modal primitive is already wired for inline validation and feedback.",
        title: "Missing export file name",
        tone: "error",
      });

      return;
    }

    setExportFileNameError(undefined);
    setIsExportModalOpen(false);

    showToast({
      description: `${trimmedExportFileName}.pdf is ready to be generated.`,
      title: "Export queued",
      tone: "success",
    });
  }

  function handleToastPreview(tone: "error" | "info" | "success") {
    const titleByTone = {
      error: "Validation error",
      info: "Autosave preview",
      success: "Draft saved",
    } as const;

    const descriptionByTone = {
      error: "Errors should be clear and quiet, not visually noisy.",
      info: "Informational feedback should stay brief and non-blocking.",
      success: "Success feedback should confirm the action and disappear.",
    } as const;

    showToast({
      description: descriptionByTone[tone],
      title: titleByTone[tone],
      tone,
    });
  }

  if (!activeScene) {
    return null;
  }

  return (
    <>
      <div className="foundation-page">
        <aside className="foundation-rail" aria-label="Playground navigation">
          <div className="foundation-rail__brand">
            <span className="foundation-rail__mark" aria-hidden="true">
              <FoundationIcon name="compose" />
            </span>
          </div>

          <nav className="foundation-rail__nav">
            {foundationRailItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="foundation-rail__item"
                data-active={item.active ? "true" : "false"}
                aria-current={item.active ? "page" : undefined}
                aria-label={item.label}
              >
                <span className="foundation-rail__icon" aria-hidden="true">
                  <FoundationIcon name={item.icon} />
                </span>
              </button>
            ))}
          </nav>

          <button type="button" className="foundation-rail__compose" aria-label="Create new script">
            <FoundationIcon name="compose" />
          </button>
        </aside>

        <div className="foundation-stage">
          <header className="foundation-header">
            <div className="foundation-header__copy">
              <p className="section-eyebrow">Internal Playground / Visual Foundation</p>
              <h1 className="foundation-header__title">{siteConfig.name}</h1>
              <p className="foundation-header__description">
                This route keeps the visual exploration available without treating it as the product
                shell. The script preview now renders from the canonical screenplay model.
              </p>
              <p className="foundation-header__description">
                <Link href={routes.playgroundPrototype} className="foundation-prototype-link">
                  Mapa del prototipo producto (rutas y estados)
                </Link>
              </p>
            </div>

            <div className="foundation-header__actions">
              <ThemeToggle className="foundation-action foundation-action--theme" />
              <button type="button" className="foundation-action" onClick={handleOpenExportModal}>
                <FoundationIcon name="export" />
                <span>Export</span>
              </button>
              <button type="button" className="foundation-action">
                <FoundationIcon name="settings" />
                <span>Settings</span>
              </button>
            </div>
          </header>

          <main className="foundation-main">
            <section className="foundation-editor-preview">
              <div className="foundation-editor-preview__lead">
                <div>
                  <p className="foundation-kicker">Writing Surface</p>
                  <h2 className="foundation-section-title">
                    The page stays central while navigation and controls remain secondary.
                  </h2>
                </div>

                <div className="foundation-breadcrumbs" aria-label="Current scene">
                  <span>Playground</span>
                  <span aria-hidden="true">/</span>
                  <span>Visual foundation</span>
                  <span aria-hidden="true">/</span>
                  <span className="foundation-breadcrumbs__current">{activeScene.indexLabel}</span>
                </div>
              </div>

              <div className="foundation-editor-grid">
                <div className="foundation-script-stage">
                  <p className="foundation-script-stage__label">{activeScene.indexLabel}</p>

                  <article className="foundation-script-sheet">
                    {activeScene.scriptLines.map((line) => (
                      <p key={line.id} className="script-line" data-line-type={line.type}>
                        {line.text}
                      </p>
                    ))}
                  </article>
                </div>

                <div className="foundation-scene-column">
                  <p className="foundation-kicker">Scene Navigator</p>

                  <ol className="foundation-scene-list">
                    {foundationPreviewScenes.map((scene) => (
                      <li key={scene.id}>
                        <button
                          type="button"
                          className="foundation-scene-item"
                          data-active={scene.id === activeScene.id ? "true" : "false"}
                          onClick={() => setActiveSceneId(scene.id)}
                        >
                          <span className="foundation-scene-item__index">{scene.indexLabel}</span>
                          <span className="foundation-scene-item__title">{scene.heading}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <section className="foundation-system">
              <div className="foundation-system__intro">
                <p className="foundation-kicker">Component Foundation</p>
                <h2 className="foundation-section-title">
                  Reusable primitives without turning the screen into a grid of boxes.
                </h2>
              </div>

              <div className="foundation-lines">
                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Buttons</h3>
                    <p>Primary, secondary and ghost actions with calmer hover states.</p>
                  </div>

                  <div className="foundation-line__content foundation-line__content--inline">
                    <Button>Primary action</Button>
                    <Button variant="secondary">Secondary action</Button>
                    <Button variant="ghost">Ghost action</Button>
                  </div>
                </section>

                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Inputs</h3>
                    <p>Base field styling for metadata, auth and editor-adjacent settings.</p>
                  </div>

                  <div className="foundation-line__content foundation-line__content--stack">
                    <Input
                      label="Project title"
                      name="demoProjectTitle"
                      value={demoProjectTitle}
                      hint="Campo editable para probar foco, texto y estilos."
                      onChange={(event) => setDemoProjectTitle(event.target.value)}
                    />
                  </div>
                </section>

                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Feedback</h3>
                    <p>Modal and toast feedback exist as primitives, not as the core layout.</p>
                  </div>

                  <div className="foundation-line__content foundation-line__content--inline">
                    <Button variant="secondary" onClick={handleOpenExportModal}>
                      Open modal
                    </Button>
                    <Button variant="ghost" onClick={() => handleToastPreview("info")}>
                      Info toast
                    </Button>
                    <Button variant="ghost" onClick={() => handleToastPreview("success")}>
                      Success toast
                    </Button>
                    <Button variant="ghost" onClick={() => handleToastPreview("error")}>
                      Error toast
                    </Button>
                  </div>
                </section>

                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Loading</h3>
                    <p>Skeletons should suggest structure without adding visual clutter.</p>
                  </div>

                  <div className="foundation-line__content foundation-line__content--stack">
                    <div className="foundation-skeletons">
                      <Skeleton height="0.75rem" width="18%" />
                      <Skeleton height="4rem" />
                      <Skeleton height="0.95rem" width="82%" />
                      <Skeleton height="0.95rem" width="68%" />
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <section className="foundation-summary">
              <div className="foundation-summary__column">
                <p className="foundation-kicker">Coverage</p>
                <ul className="foundation-summary__list">
                  {foundationChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="foundation-summary__column">
                <p className="foundation-kicker">Style Rules</p>
                <ul className="foundation-summary__list">
                  {foundationToneNotes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Modal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        title="Export screenplay PDF"
        description="This keeps the modal primitive visible in the foundation playground without turning it into the page layout."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQueueExport}>Generate PDF</Button>
          </>
        }
      >
        <div className="export-sheet">
          <Input
            label="Export file name"
            value={exportFileName}
            error={exportFileNameError}
            hint="Use a short kebab-case name for the generated PDF."
            onChange={(event) => {
              setExportFileName(event.target.value);

              if (exportFileNameError) {
                setExportFileNameError(undefined);
              }
            }}
          />

          <div className="export-sheet__details">
            <div className="export-sheet__row">
              <span>Scene</span>
              <strong>{activeScene.indexLabel}</strong>
            </div>
            <div className="export-sheet__row">
              <span>Heading</span>
              <strong>{activeScene.heading}</strong>
            </div>
            <div className="export-sheet__row">
              <span>Format</span>
              <strong>Professional screenplay PDF</strong>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
