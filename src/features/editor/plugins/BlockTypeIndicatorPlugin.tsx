"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $isScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";
import { getBlockTypeLabel } from "@/features/editor/screenplay-flow";
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

import styles from "@/features/editor/components/screenplay-editor.module.css";

type BlockTypeIndicatorPluginProps = {
  onBlockTypeChange?: (blockType: ScreenplayBlockType) => void;
};

export function BlockTypeIndicatorPlugin({
  onBlockTypeChange,
}: BlockTypeIndicatorPluginProps): React.ReactElement {
  const [editor] = useLexicalComposerContext();
  const [activeBlockType, setActiveBlockType] =
    useState<ScreenplayBlockType>("action");
  const [visible, setVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const prevBlockTypeRef = useRef<ScreenplayBlockType>("action");

  const showIndicator = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    setVisible(true);
    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchorNode = selection.anchor.getNode();
        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParent();

        if (!blockNode || !$isScreenplayBlockNode(blockNode)) return;

        const blockType = blockNode.getBlockType();
        setActiveBlockType(blockType);
        onBlockTypeChange?.(blockType);

        if (prevBlockTypeRef.current !== blockType) {
          prevBlockTypeRef.current = blockType;
          showIndicator();
        }
      });
    });
  }, [editor, onBlockTypeChange, showIndicator]);

  return (
    <div
      className={`${styles.blockTypeIndicator} ${visible ? styles.blockTypeIndicatorVisible : ""}`}
      aria-live="polite"
      role="status"
    >
      <span className={styles.blockTypeIndicatorLabel}>
        {getBlockTypeLabel(activeBlockType)}
      </span>
      <span className={styles.blockTypeIndicatorHint}>Tab to change</span>
    </div>
  );
}
