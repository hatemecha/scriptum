"use client";

import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $isScreenplayBlockNode,
  ScreenplayBlockNode,
} from "@/features/editor/nodes/ScreenplayBlockNode";

// INT./EXT. + location (+ optional time) in common screenplay forms.
const SCENE_HEADING_RE =
  /^(?:INT|EXT|INT\.?\/EXT|EXT\.?\/INT|INT\/EXT|EXT\/INT|I\/E)\.?\s+.+$/i;

// Basic transition cues; uppercase style keeps false positives low.
const TRANSITION_RE =
  /^(?:CUT TO:|SMASH CUT TO:|MATCH CUT TO:|DISSOLVE TO:|FADE IN:|FADE OUT\.|WIPE TO:|INTERCUT:|BACK TO:|CONTINUED:)/;

function shouldBecomeSceneHeading(text: string): boolean {
  const value = text.trim();
  if (value.length < 5) return false;
  return SCENE_HEADING_RE.test(value);
}

function shouldBecomeTransition(text: string): boolean {
  const value = text.trim();
  if (value.length < 4) return false;
  return TRANSITION_RE.test(value.toUpperCase());
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

