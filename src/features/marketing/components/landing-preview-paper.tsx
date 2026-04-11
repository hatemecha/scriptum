"use client";

import { useEffect, useMemo, useState } from "react";

import { type PreviewLine } from "@/features/product/preview-data";
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

import styles from "./landing-page.module.css";

const previewBlockClassName: Record<ScreenplayBlockType, string> = {
  "scene-heading": "screenplay-block screenplay-block--scene-heading",
  action: "screenplay-block screenplay-block--action",
  character: "screenplay-block screenplay-block--character",
  dialogue: "screenplay-block screenplay-block--dialogue",
  parenthetical: "screenplay-block screenplay-block--parenthetical",
  transition: "screenplay-block screenplay-block--transition",
};

const DIALOGUE_ALTERNATES = [
  "Dejá el borrador abierto. El silencio también es parte de la escena.",
  "Una línea honesta. La siguiente ya sabe dónde apoyarse.",
] as const;

type LandingPreviewPaperProps = {
  lines: readonly PreviewLine[];
};

export function LandingPreviewPaper({ lines }: LandingPreviewPaperProps) {
  const reducedMotion = usePrefersReducedMotion();
  const animLineIndex = useMemo(() => {
    const i = lines.findIndex((l) => l.type === "dialogue");
    return i >= 0 ? i : Math.max(0, lines.length - 1);
  }, [lines]);

  const rotateStrings = useMemo(() => {
    const primary = lines[animLineIndex]?.text ?? "";
    const merged = [primary, ...DIALOGUE_ALTERNATES];
    return [...new Set(merged.filter(Boolean))];
  }, [lines, animLineIndex]);

  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

  useEffect(() => {
    /* Typewriter demo: dependency change resets display synchronously; further updates run inside timeouts. */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (rotateStrings.length === 0) {
      setDisplay("");
      return;
    }

    if (reducedMotion) {
      setDisplay(rotateStrings[0] ?? "");
      return;
    }

    let strIdx = 0;
    let charIdx = 0;
    let localPhase: "typing" | "pause" | "deleting" = "typing";
    let timeoutId: number | undefined;

    const tick = () => {
      const list = rotateStrings;
      const full = list[strIdx] ?? "";
      if (localPhase === "typing") {
        if (charIdx < full.length) {
          charIdx += 1;
          setDisplay(full.slice(0, charIdx));
          setPhase("typing");
          timeoutId = window.setTimeout(tick, 36 + Math.floor(Math.random() * 12));
        } else {
          localPhase = "pause";
          setPhase("pause");
          timeoutId = window.setTimeout(() => {
            localPhase = "deleting";
            setPhase("deleting");
            tick();
          }, 2200);
        }
      } else if (localPhase === "deleting") {
        if (charIdx > 0) {
          charIdx -= 1;
          setDisplay(full.slice(0, charIdx));
          timeoutId = window.setTimeout(tick, 20);
        } else {
          strIdx = (strIdx + 1) % list.length;
          localPhase = "typing";
          setPhase("typing");
          timeoutId = window.setTimeout(tick, 420);
        }
      }
    };

    charIdx = 0;
    strIdx = 0;
    setDisplay("");
    localPhase = "typing";
    tick();
    /* eslint-enable react-hooks/set-state-in-effect */

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [reducedMotion, rotateStrings]);

  const showCaret = !reducedMotion && (phase === "typing" || phase === "pause");

  return (
    <div className={styles.paperViewport}>
      <article
        className={styles.paper}
        aria-label="Vista previa del editor con demostración de escritura"
      >
        <div className="screenplay-editor-root">
          {lines.map((line, index) => (
            <div key={line.id} className={previewBlockClassName[line.type]}>
              {index === animLineIndex ? (
                <>
                  {display}
                  {showCaret ? (
                    <span className={styles.typeCaret} aria-hidden="true">
                      |
                    </span>
                  ) : null}
                </>
              ) : (
                line.text
              )}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
