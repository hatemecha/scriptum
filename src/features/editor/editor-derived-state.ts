import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type EditorState,
  type LexicalNode,
} from "lexical";

import { $isScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";

export type DerivedSceneNav = {
  id: string;
  indexLabel: string;
  heading: string;
  snippet: string;
};

function truncateSnippet(text: string, max = 52): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Escenas = un bloque `scene-heading` por entrada; snippet = primer texto no vacío siguiente.
 */
export function deriveSceneNavigators(editorState: EditorState): DerivedSceneNav[] {
  return editorState.read(() => {
    const root = $getRoot();
    const scenes: DerivedSceneNav[] = [];
    let sceneOrdinal = 0;
    let needSnippetForLast = false;

    for (const node of root.getChildren()) {
      if (!$isScreenplayBlockNode(node)) continue;

      const blockType = node.getBlockType();

      if (blockType === "scene-heading") {
        sceneOrdinal += 1;
        const heading = node.getTextContent().trim() || "Sin título";
        scenes.push({
          id: node.getKey(),
          indexLabel: `${sceneOrdinal}.`,
          heading,
          snippet: "",
        });
        needSnippetForLast = true;
        continue;
      }

      if (needSnippetForLast && scenes.length > 0) {
        const text = node.getTextContent().trim();
        if (text.length > 0) {
          scenes[scenes.length - 1]!.snippet = truncateSnippet(text);
          needSnippetForLast = false;
        }
      }
    }

    return scenes;
  });
}

/** Clave del encabezado de escena que contiene el cursor (o null). */
export function deriveActiveSceneKey(editorState: EditorState): string | null {
  return editorState.read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return null;
    }

    const anchorNode = selection.anchor.getNode();
    const blockNode = $isScreenplayBlockNode(anchorNode)
      ? anchorNode
      : anchorNode.getParent();

    if (!blockNode || !$isScreenplayBlockNode(blockNode)) {
      return null;
    }

    if (blockNode.getBlockType() === "scene-heading") {
      return blockNode.getKey();
    }

    let walk: LexicalNode | null = blockNode;
    while (walk) {
      if ($isScreenplayBlockNode(walk) && walk.getBlockType() === "scene-heading") {
        return walk.getKey();
      }
      walk = walk.getPreviousSibling();
    }

    return null;
  });
}

export function estimatePagesFromEditorState(editorState: EditorState): number {
  return editorState.read(() => {
    const root = $getRoot();
    let lines = 0;

    for (const node of root.getChildren()) {
      if (!$isScreenplayBlockNode(node)) continue;
      const text = node.getTextContent();
      const baseLines = Math.max(1, Math.ceil(text.length / 42));
      const t = node.getBlockType();
      const weighted =
        t === "dialogue" || t === "parenthetical" ? baseLines + 1 : baseLines;
      lines += weighted;
    }

    return Math.max(1, Math.ceil(lines / 55));
  });
}

export type SerializedBlock = {
  type: ScreenplayBlockType;
  text: string;
};

export function serializeScreenplayBlocks(editorState: EditorState): SerializedBlock[] {
  return editorState.read(() => {
    const root = $getRoot();
    const out: SerializedBlock[] = [];
    for (const node of root.getChildren()) {
      if (!$isScreenplayBlockNode(node)) continue;
      out.push({
        type: node.getBlockType(),
        text: node.getTextContent(),
      });
    }
    return out;
  });
}
