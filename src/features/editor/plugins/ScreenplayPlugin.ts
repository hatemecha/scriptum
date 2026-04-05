"use client";

import { useEffect } from "react";

import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  ParagraphNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { SET_BLOCK_TYPE_COMMAND } from "@/features/editor/commands";
import {
  $createScreenplayBlockNode,
  $isScreenplayBlockNode,
  ScreenplayBlockNode,
} from "@/features/editor/nodes/ScreenplayBlockNode";
import {
  getNextBlockTypeOnEnter,
  getBlockTypeOnEmptyEnter,
  getNextBlockTypeOnTab,
  getPrevBlockTypeOnShiftTab,
  getBlockTypeOnBackspaceAtStart,
} from "@/features/editor/screenplay-flow";

function isBlockEmpty(node: ScreenplayBlockNode): boolean {
  return node.getTextContent().length === 0;
}

export function ScreenplayPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ScreenplayBlockNode])) {
      throw new Error(
        "ScreenplayPlugin: ScreenplayBlockNode is not registered.",
      );
    }

    return editor.registerNodeTransform(ParagraphNode, (node) => {
      const block = $createScreenplayBlockNode("action");
      node.getChildren().forEach((child) => block.append(child));
      node.replace(block);
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow();

        if (!$isScreenplayBlockNode(blockNode)) return false;

        event?.preventDefault();
        const currentType = blockNode.getBlockType();

        if (isBlockEmpty(blockNode)) {
          const convertTo = getBlockTypeOnEmptyEnter(currentType);
          if (convertTo) {
            blockNode.setBlockType(convertTo);
          }
          return true;
        }

        if (!selection.isCollapsed()) {
          selection.removeText();
        }

        const refreshedAnchor = selection.anchor.getNode();
        const refreshedOffset = selection.anchor.offset;

        if ($isScreenplayBlockNode(refreshedAnchor)) {
          const nextType = getNextBlockTypeOnEnter(currentType);
          const newBlock = $createScreenplayBlockNode(nextType);
          blockNode.insertAfter(newBlock);
          newBlock.selectStart();
          return true;
        }

        if (!$isTextNode(refreshedAnchor)) {
          const nextType = getNextBlockTypeOnEnter(currentType);
          const newBlock = $createScreenplayBlockNode(nextType);
          blockNode.insertAfter(newBlock);
          newBlock.selectStart();
          return true;
        }

        const textNode = refreshedAnchor;
        const fullText = textNode.getTextContent();
        const isAtEnd =
          refreshedOffset === textNode.getTextContentSize() &&
          textNode.getNextSibling() === null;
        const isAtStart =
          refreshedOffset === 0 && textNode.getPreviousSibling() === null;

        if (isAtEnd) {
          const nextType = getNextBlockTypeOnEnter(currentType);
          const newBlock = $createScreenplayBlockNode(nextType);
          blockNode.insertAfter(newBlock);
          newBlock.selectStart();
          return true;
        }

        if (isAtStart) {
          const newBlockBefore = $createScreenplayBlockNode("action");
          blockNode.insertBefore(newBlockBefore);
          return true;
        }

        const beforeText = fullText.slice(0, refreshedOffset);
        const afterText = fullText.slice(refreshedOffset);
        const nextType = getNextBlockTypeOnEnter(currentType);

        textNode.setTextContent(beforeText);

        const siblingsAfter = [];
        let sibling = textNode.getNextSibling();
        while (sibling) {
          siblingsAfter.push(sibling);
          sibling = sibling.getNextSibling();
        }

        const newBlock = $createScreenplayBlockNode(nextType);

        if (afterText.length > 0) {
          newBlock.append($createTextNode(afterText));
        }

        for (const s of siblingsAfter) {
          newBlock.append(s);
        }

        blockNode.insertAfter(newBlock);
        newBlock.selectStart();

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow();

        if (!$isScreenplayBlockNode(blockNode)) return false;

        event?.preventDefault();
        const currentType = blockNode.getBlockType();

        if (event?.shiftKey) {
          blockNode.setBlockType(getPrevBlockTypeOnShiftTab(currentType));
        } else {
          blockNode.setBlockType(getNextBlockTypeOnTab(currentType));
        }

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SET_BLOCK_TYPE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const anchorNode = selection.anchor.getNode();
        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow();

        if (!$isScreenplayBlockNode(blockNode)) return false;

        blockNode.setBlockType(payload.blockType);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow();

        if (!$isScreenplayBlockNode(blockNode)) return false;

        const isAtStart = $isScreenplayBlockNode(anchorNode)
          ? true
          : anchorOffset === 0 && anchorNode.getPreviousSibling() === null;

        if (!isAtStart) return false;

        event?.preventDefault();
        const currentType = blockNode.getBlockType();
        const convertTo = getBlockTypeOnBackspaceAtStart(currentType);

        if (convertTo) {
          blockNode.setBlockType(convertTo);
          return true;
        }

        const prevSibling = blockNode.getPreviousSibling();
        if (!prevSibling || !$isScreenplayBlockNode(prevSibling)) return true;

        if (isBlockEmpty(blockNode)) {
          blockNode.remove();
          prevSibling.selectEnd();
          return true;
        }

        if (isBlockEmpty(prevSibling)) {
          prevSibling.remove();
          blockNode.selectStart();
          return true;
        }

        const mergeOffset = prevSibling.getTextContent().length;
        const currentChildren = blockNode.getChildren();

        for (const child of currentChildren) {
          prevSibling.append(child);
        }

        blockNode.remove();

        const textNodes = prevSibling.getChildren();
        let charCount = 0;
        for (const child of textNodes) {
          if ($isTextNode(child)) {
            const len = child.getTextContentSize();
            if (charCount + len >= mergeOffset) {
              child.select(
                mergeOffset - charCount,
                mergeOffset - charCount,
              );
              break;
            }
            charCount += len;
          }
        }

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_DELETE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParentOrThrow();

        if (!$isScreenplayBlockNode(blockNode)) return false;

        const isAtEnd = $isScreenplayBlockNode(anchorNode)
          ? blockNode.getChildrenSize() === 0
          : $isTextNode(anchorNode) &&
            anchorOffset === anchorNode.getTextContentSize() &&
            anchorNode.getNextSibling() === null;

        if (!isAtEnd) return false;

        const nextSibling = blockNode.getNextSibling();
        if (!nextSibling || !$isScreenplayBlockNode(nextSibling)) return false;

        event?.preventDefault();

        if (isBlockEmpty(nextSibling)) {
          nextSibling.remove();
          return true;
        }

        if (isBlockEmpty(blockNode)) {
          blockNode.remove();
          nextSibling.selectStart();
          return true;
        }

        const mergeOffset = blockNode.getTextContent().length;
        const nextChildren = nextSibling.getChildren();

        for (const child of nextChildren) {
          blockNode.append(child);
        }

        nextSibling.remove();

        const textNodes = blockNode.getChildren();
        let charCount = 0;
        for (const child of textNodes) {
          if ($isTextNode(child)) {
            const len = child.getTextContentSize();
            if (charCount + len >= mergeOffset) {
              child.select(
                mergeOffset - charCount,
                mergeOffset - charCount,
              );
              break;
            }
            charCount += len;
          }
        }

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
