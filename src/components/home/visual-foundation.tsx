"use client";

import { useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";

type ScriptLineType =
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "scene"
  | "transition";

type ScriptLine = {
  content: string;
  type: ScriptLineType;
};

type SceneRecord = {
  heading: string;
  id: string;
  indexLabel: string;
  scriptLines: ScriptLine[];
};

type RailItem = {
  active?: boolean;
  icon: IconName;
  label: string;
};

type IconName =
  | "characters"
  | "compose"
  | "drafts"
  | "export"
  | "outline"
  | "research"
  | "scenes"
  | "settings";

const railItems: RailItem[] = [
  {
    active: true,
    icon: "drafts",
    label: "Drafts",
  },
  {
    icon: "scenes",
    label: "Scenes",
  },
  {
    icon: "research",
    label: "Research",
  },
  {
    icon: "characters",
    label: "Characters",
  },
  {
    icon: "outline",
    label: "Outline",
  },
];

const scenes: SceneRecord[] = [
  {
    heading: "EXT. CITY STREET - NIGHT",
    id: "scene-1",
    indexLabel: "Scene 1",
    scriptLines: [
      {
        content: "EXT. CITY STREET - NIGHT",
        type: "scene",
      },
      {
        content:
          "Traffic washes the avenue in white streaks while a lone figure moves through the crowd without looking up.",
        type: "action",
      },
      {
        content: "WRITER",
        type: "character",
      },
      {
        content: "Nobody notices the first decision. They only notice the fallout.",
        type: "dialogue",
      },
    ],
  },
  {
    heading: "INT. APARTMENT - CONTINUOUS",
    id: "scene-2",
    indexLabel: "Scene 2",
    scriptLines: [
      {
        content: "INT. APARTMENT - CONTINUOUS",
        type: "scene",
      },
      {
        content:
          "The apartment is almost empty. A desk lamp burns over scattered pages and a glass gone flat.",
        type: "action",
      },
      {
        content: "WRITER",
        type: "character",
      },
      {
        content: "(half awake)",
        type: "parenthetical",
      },
      {
        content: "I can fix the page. I just need the room to stop watching me.",
        type: "dialogue",
      },
    ],
  },
  {
    heading: "INT. COFFEE SHOP - DAY",
    id: "scene-4",
    indexLabel: "Scene 4",
    scriptLines: [
      {
        content: "INT. COFFEE SHOP - DAY",
        type: "scene",
      },
      {
        content:
          "A writer is hunched over their laptop. Cups knock together in the background, but the table feels sealed off from the room.",
        type: "action",
      },
      {
        content: "WRITER",
        type: "character",
      },
      {
        content: "(to themselves)",
        type: "parenthetical",
      },
      {
        content: "Just one more page.",
        type: "dialogue",
      },
      {
        content:
          "They type again. The cursor blinks with the stubborn rhythm of a heartbeat.",
        type: "action",
      },
    ],
  },
  {
    heading: "INT. SUBWAY STATION - LATE",
    id: "scene-5",
    indexLabel: "Scene 5",
    scriptLines: [
      {
        content: "INT. SUBWAY STATION - LATE",
        type: "scene",
      },
      {
        content:
          "Fluorescent light smears across the tiles. The station hums with a tired, metallic patience.",
        type: "action",
      },
      {
        content: "CUT TO:",
        type: "transition",
      },
    ],
  },
];

const foundationChecklist = [
  "Token-based color, spacing, typography, shadows, and radii.",
  "Dark editorial direction with a working light mode toggle.",
  "Reusable button, input, modal, toast, and skeleton primitives.",
  "A calm app layout that can grow into the real editor without redoing the system.",
];

const toneNotes = [
  "Use layout and spacing first, not a grid of cards.",
  "Keep the writing surface dominant.",
  "Reserve accent color for selection, feedback, and active state.",
  "Avoid decorative motion in core interactions.",
];

export function VisualFoundation() {
  const [activeSceneId, setActiveSceneId] = useState("scene-4");
  const [exportFileName, setExportFileName] = useState("scene-4-draft");
  const [exportFileNameError, setExportFileNameError] = useState<string>();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { showToast } = useToast();

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0],
    [activeSceneId],
  );

  function handleOpenExportModal() {
    setExportFileName(activeScene.id);
    setExportFileNameError(undefined);
    setIsExportModalOpen(true);
  }

  function handleQueueExport() {
    const trimmedExportFileName = exportFileName.trim();

    if (trimmedExportFileName.length === 0) {
      setExportFileNameError("Export file name is required.");

      showToast({
        description:
          "The modal primitive is already wired for inline validation and feedback.",
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

  return (
    <>
      <div className="foundation-page">
        <aside className="foundation-rail" aria-label="Primary navigation">
          <div className="foundation-rail__brand">
            <span className="foundation-rail__mark" aria-hidden="true">
              <InterfaceIcon name="compose" />
            </span>
          </div>

          <nav className="foundation-rail__nav">
            {railItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="foundation-rail__item"
                data-active={item.active ? "true" : "false"}
                aria-current={item.active ? "page" : undefined}
                aria-label={item.label}
              >
                <span className="foundation-rail__icon" aria-hidden="true">
                  <InterfaceIcon name={item.icon} />
                </span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="foundation-rail__compose"
            aria-label="Create new script"
          >
            <InterfaceIcon name="compose" />
          </button>
        </aside>

        <div className="foundation-stage">
          <header className="foundation-header">
            <div className="foundation-header__copy">
              <p className="section-eyebrow">Phase 0 / Day 2</p>
              <h1 className="foundation-header__title">{siteConfig.name}</h1>
              <p className="foundation-header__description">
                Visual foundation view: reusable UI primitives plus an editorial
                writing preview using the dark style direction you marked.
              </p>
            </div>

            <div className="foundation-header__actions">
              <ThemeToggle className="foundation-action foundation-action--theme" />
              <button
                type="button"
                className="foundation-action"
                onClick={handleOpenExportModal}
              >
                <InterfaceIcon name="export" />
                <span>Export</span>
              </button>
              <button type="button" className="foundation-action">
                <InterfaceIcon name="settings" />
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
                    The page stays central while navigation and controls remain
                    secondary.
                  </h2>
                </div>

                <div className="foundation-breadcrumbs" aria-label="Current scene">
                  <span>Drafts</span>
                  <span aria-hidden="true">/</span>
                  <span>Act I</span>
                  <span aria-hidden="true">/</span>
                  <span className="foundation-breadcrumbs__current">
                    {activeScene.indexLabel}
                  </span>
                </div>
              </div>

              <div className="foundation-editor-grid">
                <div className="foundation-script-stage">
                  <p className="foundation-script-stage__label">
                    {activeScene.indexLabel}
                  </p>

                  <article className="foundation-script-sheet">
                    {activeScene.scriptLines.map((line) => (
                      <p
                        key={`${activeScene.id}-${line.type}-${line.content}`}
                        className="script-line"
                        data-line-type={line.type}
                      >
                        {line.content}
                      </p>
                    ))}
                  </article>
                </div>

                <div className="foundation-scene-column">
                  <p className="foundation-kicker">Scene Navigator</p>

                  <ol className="foundation-scene-list">
                    {scenes.map((scene) => (
                      <li key={scene.id}>
                        <button
                          type="button"
                          className="foundation-scene-item"
                          data-active={
                            scene.id === activeScene.id ? "true" : "false"
                          }
                          onClick={() => setActiveSceneId(scene.id)}
                        >
                          <span className="foundation-scene-item__index">
                            {scene.indexLabel}
                          </span>
                          <span className="foundation-scene-item__title">
                            {scene.heading}
                          </span>
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
                  Reusable primitives without turning the screen into a grid of
                  boxes.
                </h2>
              </div>

              <div className="foundation-lines">
                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Buttons</h3>
                    <p>
                      Primary, secondary and ghost actions with calmer hover
                      states.
                    </p>
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
                    <p>
                      Base field styling for metadata, auth and editor-adjacent
                      settings.
                    </p>
                  </div>

                  <div className="foundation-line__content foundation-line__content--stack">
                    <Input
                      label="Project title"
                      value="The Silent Editor"
                      hint="Shared input styling for forms and secondary settings."
                      readOnly
                    />
                  </div>
                </section>

                <section className="foundation-line">
                  <div className="foundation-line__meta">
                    <h3>Feedback</h3>
                    <p>
                      Modal and toast feedback exist as primitives, not as the
                      core layout.
                    </p>
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
                    <p>
                      Skeletons should suggest structure without adding visual
                      clutter.
                    </p>
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
                <p className="foundation-kicker">Day 2 Coverage</p>
                <ul className="foundation-summary__list">
                  {foundationChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="foundation-summary__column">
                <p className="foundation-kicker">Style Rules</p>
                <ul className="foundation-summary__list">
                  {toneNotes.map((item) => (
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
        description="This keeps the modal primitive visible in the foundation view without turning it into the page layout."
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

type InterfaceIconProps = {
  name: IconName;
};

function InterfaceIcon({ name }: InterfaceIconProps) {
  switch (name) {
    case "characters":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M4.5 18.5C5.3 15.9 7.2 14.5 10 14.5C12.8 14.5 14.7 15.9 15.5 18.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M18 9.5L20.5 12L18 14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "compose":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 16.5V20H7.5L18.3 9.2L14.8 5.7L4 16.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M13.8 6.7L17.3 10.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "drafts":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 7H14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 12H14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 17H12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M15 16L17.7 18.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M13.7 19L14.3 16.9L17.6 13.6C17.95 13.25 18.5 13.25 18.85 13.6C19.2 13.95 19.2 14.5 18.85 14.85L15.55 18.15L13.7 19Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "export":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4.5V14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.5 8L12 4.5L15.5 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 13.5V18.5H18.5V13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "outline":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="7" r="1.2" fill="currentColor" />
          <circle cx="6.5" cy="12" r="1.2" fill="currentColor" />
          <circle cx="6.5" cy="17" r="1.2" fill="currentColor" />
          <path
            d="M10 7H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M10 12H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M10 17H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 5.5H15.5C17.4 5.5 18.5 6.6 18.5 8.5V18.5L15.5 16.6L12 18.5L8.5 16.6L5.5 18.5V8.5C5.5 6.6 6.6 5.5 8.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 9.5H15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.5 12.5H13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "scenes":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="4.5"
            y="5.5"
            width="15"
            height="10"
            rx="1.8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M8 5.5V15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16.5 8.5V12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M7.5 18.5H16.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.75L13.17 5.52C13.65 5.63 14.11 5.82 14.52 6.08L16.58 5.48L18.52 7.42L17.92 9.48C18.18 9.89 18.37 10.35 18.48 10.83L20.25 12L18.48 13.17C18.37 13.65 18.18 14.11 17.92 14.52L18.52 16.58L16.58 18.52L14.52 17.92C14.11 18.18 13.65 18.37 13.17 18.48L12 20.25L10.83 18.48C10.35 18.37 9.89 18.18 9.48 17.92L7.42 18.52L5.48 16.58L6.08 14.52C5.82 14.11 5.63 13.65 5.52 13.17L3.75 12L5.52 10.83C5.63 10.35 5.82 9.89 6.08 9.48L5.48 7.42L7.42 5.48L9.48 6.08C9.89 5.82 10.35 5.63 10.83 5.52L12 3.75Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3.1"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}
