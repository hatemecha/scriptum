"use client";

import { useEffect, useState } from "react";

import {
  $getRoot,
  $isParagraphNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $isScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";

import styles from "@/features/editor/components/screenplay-editor.module.css";

type PlaceholderPluginProps = {
  text: string;
};

export function PlaceholderPlugin({
  text,
}: PlaceholderPluginProps): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length === 0) {
          setIsEmpty(true);
          return;
        }

        if (children.length > 1) {
          setIsEmpty(false);
          return;
        }

        const firstChild = children[0];

        if ($isScreenplayBlockNode(firstChild) || $isParagraphNode(firstChild)) {
          setIsEmpty(firstChild.getTextContent().length === 0);
          return;
        }

        setIsEmpty(false);
      });
    });
  }, [editor]);

  if (!isEmpty) return null;

  return <div className={styles.editorPlaceholder}>{text}</div>;
}
