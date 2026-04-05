"use client";

import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function AutoFocusPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      editor.focus(
        () => {
          const root = editor.getRootElement();
          if (root) {
            root.style.caretColor = "";
          }
        },
        { defaultSelection: "rootEnd" },
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [editor]);

  return null;
}
