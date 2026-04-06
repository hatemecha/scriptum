"use client";

import { Fragment, useCallback, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  type GlossaryExampleRole,
  SCREENPLAY_GLOSSARY_ENTRIES,
  filterGlossaryEntriesBySearch,
} from "@/features/screenplay/editor-help/glossary";
import { cn } from "@/lib/cn";

import styles from "./editor-glossary-modal.module.css";

const STUDIOBINDER_URL =
  "https://www.studiobinder.com/blog/screenplay-example-download/";
const NOFILMSCHOOL_URL = "https://nofilmschool.com/topics/screenwriting";

const GLOSSARY_EXAMPLE_ROW_CLASS: Record<GlossaryExampleRole, string> = {
  "scene-heading": styles.scriptLineSceneHeading,
  action: styles.scriptLineAction,
  character: styles.scriptLineCharacter,
  dialogue: styles.scriptLineDialogue,
  parenthetical: styles.scriptLineParenthetical,
  transition: styles.scriptLineTransition,
};

type EditorGlossaryModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function EditorGlossaryModal({ onOpenChange, open }: EditorGlossaryModalProps) {
  const [query, setQuery] = useState("");

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setQuery("");
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const filtered = useMemo(() => filterGlossaryEntriesBySearch(open ? query : ""), [open, query]);

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Glosario del guion"
      description="Buscá por palabra o por lo que querés escribir; coinciden título, definición y texto de los ejemplos."
      className={styles.modalSurface}
      closeLabel="Cerrar glosario"
    >
      <div className={styles.searchField}>
        <Input
          label="Buscar en el glosario"
          name="glossarySearch"
          value={query}
          placeholder="p. ej. nueva escena, paréntesis, narrar acción…"
          hint="Coincidencias en término, definición, ejemplo o bloque."
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className={styles.scroll}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState} role="status">
            No hay entradas que coincidan. Probá otra palabra o borrá el filtro.
          </p>
        ) : (
          <dl className={styles.list}>
            {filtered.map((entry) => (
              <Fragment key={entry.id}>
                <dt className={styles.term}>{entry.term}</dt>
                <dd className={styles.definition}>
                  <p className={styles.definitionText}>{entry.definition}</p>
                  {entry.example ? (
                    <figure className={styles.scriptSample} aria-label={`Ejemplo: ${entry.term}`}>
                      <figcaption className={styles.scriptSampleCaption}>Ejemplo</figcaption>
                      <div className={styles.scriptSamplePaper}>
                        {entry.example.rows.map((row, index) => (
                          <p
                            key={`${entry.id}-ex-${index}`}
                            className={cn(
                              styles.scriptLine,
                              GLOSSARY_EXAMPLE_ROW_CLASS[row.role],
                            )}
                          >
                            {row.text}
                          </p>
                        ))}
                      </div>
                    </figure>
                  ) : null}
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
      </div>
      <p className={styles.meta}>
        {filtered.length === SCREENPLAY_GLOSSARY_ENTRIES.length
          ? `${SCREENPLAY_GLOSSARY_ENTRIES.length} entradas`
          : `${filtered.length} de ${SCREENPLAY_GLOSSARY_ENTRIES.length} entradas`}
      </p>
      <p className={styles.footer}>
        Para profundizar:{" "}
        <a href={STUDIOBINDER_URL} target="_blank" rel="noreferrer">
          StudioBinder — ejemplos de guion
        </a>
        {" · "}
        <a href={NOFILMSCHOOL_URL} target="_blank" rel="noreferrer">
          No Film School — guion
        </a>
      </p>
    </Modal>
  );
}
