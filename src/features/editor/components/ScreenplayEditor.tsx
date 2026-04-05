"use client";

import { useCallback, useMemo } from "react";

import {
  type EditorState,
  type LexicalEditor,
  $getRoot,
  $createTextNode,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import {
  $createScreenplayBlockNode,
  ScreenplayBlockNode,
} from "@/features/editor/nodes/ScreenplayBlockNode";
import { screenplayEditorTheme } from "@/features/editor/editor-theme";
import { AutoFocusPlugin } from "@/features/editor/plugins/AutoFocusPlugin";
import { BlockTypeIndicatorPlugin } from "@/features/editor/plugins/BlockTypeIndicatorPlugin";
import { PlaceholderPlugin } from "@/features/editor/plugins/PlaceholderPlugin";
import { ScreenplayPlugin } from "@/features/editor/plugins/ScreenplayPlugin";
import { ScreenplaySuggestionsPlugin } from "@/features/editor/plugins/ScreenplaySuggestionsPlugin";

import styles from "./screenplay-editor.module.css";

type ScreenplayBlock = {
  id: string;
  text: string;
  type: ScreenplayBlockType;
};

type ScreenplayEditorProps = {
  initialBlocks?: readonly ScreenplayBlock[];
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  onBlockTypeChange?: (blockType: ScreenplayBlockType) => void;
  placeholder?: string;
};

function buildInitialEditorState(
  blocks: readonly ScreenplayBlock[],
): () => void {
  return function initState() {
    const root = $getRoot();

    if (blocks.length === 0) {
      const actionBlock = $createScreenplayBlockNode("action");
      root.append(actionBlock);
      return;
    }

    for (const block of blocks) {
      const node = $createScreenplayBlockNode(block.type);
      if (block.text.length > 0) {
        node.append($createTextNode(block.text));
      }
      root.append(node);
    }
  };
}

function onError(error: Error): void {
  console.error("[ScreenplayEditor]", error);
}

export function ScreenplayEditor({
  initialBlocks = [],
  onChange,
  onBlockTypeChange,
  placeholder = "Start writing your screenplay...",
}: ScreenplayEditorProps) {
  const editorStateInit = useMemo(
    () => buildInitialEditorState(initialBlocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initialConfig = useMemo(
    () => ({
      namespace: "ScriptumScreenplayEditor",
      theme: screenplayEditorTheme,
      nodes: [ScreenplayBlockNode],
      onError,
      editorState: editorStateInit,
    }),
    [editorStateInit],
  );

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      onChange?.(editorState, editor);
    },
    [onChange],
  );

  return (
    <div className={styles.editorContainer}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={styles.editorRoot}
              aria-label="Screenplay editor"
              spellCheck={false}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PlaceholderPlugin text={placeholder} />
        <HistoryPlugin />
        <ScreenplayPlugin />
        <ScreenplaySuggestionsPlugin />
        <AutoFocusPlugin />
        <BlockTypeIndicatorPlugin onBlockTypeChange={onBlockTypeChange} />
        {onChange ? (
          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        ) : null}
      </LexicalComposer>
    </div>
  );
}
