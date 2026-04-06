"use client";

import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $isScreenplayBlockNode,
  ScreenplayBlockNode,
} from "@/features/editor/nodes/ScreenplayBlockNode";
import { looksLikeParentheticalLine } from "@/features/screenplay/editor-help/parenthetical-detect";
import { looksLikeSceneHeading } from "@/features/screenplay/editor-help/scene-heading-detect";
import { looksLikeTransitionLine } from "@/features/screenplay/editor-help/transition-detect";

function shouldBecomeSceneHeading(text: string): boolean {
  return looksLikeSceneHeading(text);
}

function shouldBecomeTransition(text: string): boolean {
  return looksLikeTransitionLine(text);
}

export function AutoDetectBlockTypePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ScreenplayBlockNode])) {
      throw new Error("AutoDetectBlockTypePlugin: ScreenplayBlockNode is not registered.");
    }

    return editor.registerNodeTransform(ScreenplayBlockNode, (node) => {
      if (!$isScreenplayBlockNode(node)) return;

      const type = node.getBlockType();
      const text = node.getTextContent();

      if (
        (type === "dialogue" || type === "action") &&
        text.trim().length > 0 &&
        looksLikeParentheticalLine(text)
      ) {
        node.setBlockType("parenthetical");
        return;
      }

      if (type === "parenthetical" && text.trim().length > 0 && !looksLikeParentheticalLine(text)) {
        node.setBlockType("dialogue");
        return;
      }

      if (type === "action" && shouldBecomeSceneHeading(text)) {
        node.setBlockType("scene-heading");
        return;
      }

      if (type === "scene-heading" && !shouldBecomeSceneHeading(text) && text.trim().length > 0) {
        node.setBlockType("action");
        return;
      }

      if (type === "action" && shouldBecomeTransition(text)) {
        node.setBlockType("transition");
        return;
      }

      if (type === "transition" && !shouldBecomeTransition(text) && text.trim().length > 0) {
        node.setBlockType("action");
      }
    });
  }, [editor]);

  return null;
}

