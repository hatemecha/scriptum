"use client";

import { useEffect } from "react";

import { type LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type EditorReadyPluginProps = {
  onReady: (editor: LexicalEditor) => void;
};

export function EditorReadyPlugin({ onReady }: EditorReadyPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);

  return null;
}
