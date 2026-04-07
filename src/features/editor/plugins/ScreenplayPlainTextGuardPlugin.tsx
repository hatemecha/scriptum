"use client";

import { useEffect } from "react";

import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  PASTE_COMMAND,
  type PasteCommandType,
  TextNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $createScreenplayBlockNode,
  $isScreenplayBlockNode,
  ScreenplayBlockNode,
} from "@/features/editor/nodes/ScreenplayBlockNode";
import {
  chunkStringForPaste,
  DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE,
} from "@/features/editor/plain-text-paste-chunks";
import { isCollapsedCaretAtEndOfScreenplayBlock } from "@/features/editor/screenplay-caret-offset";
import { getNextBlockTypeOnEnter } from "@/features/editor/screenplay-flow";

function getCurrentRangeSelection() {
  const selection = $getSelection();
  return $isRangeSelection(selection) ? selection : null;
}

export function ScreenplayPlainTextGuardPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeTextFormat = editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      () => true,
      COMMAND_PRIORITY_HIGH,
    );

    const removeElementFormat = editor.registerCommand(
      FORMAT_ELEMENT_COMMAND,
      () => true,
      COMMAND_PRIORITY_HIGH,
    );

    const onPaste = editor.registerCommand<PasteCommandType>(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent)) {
          return false;
        }
        event.preventDefault();
        const text = event.clipboardData?.getData("text/plain") ?? "";
        editor.update(() => {
          function insertPlainChunks(fragment: string): void {
            for (const chunk of chunkStringForPaste(
              fragment,
              DEFAULT_PLAIN_TEXT_PASTE_CHUNK_SIZE,
            )) {
              const selection = getCurrentRangeSelection();
              if (!selection) {
                return;
              }
              selection.insertRawText(chunk);
            }
          }

          let selection = getCurrentRangeSelection();
          if (!selection) {
            return;
          }

          const normalized = text.replace(/\r\n/g, "\n");
          const lines = normalized.split("\n");

          if (lines.length <= 1) {
            insertPlainChunks(normalized);
            return;
          }

          if (!selection.isCollapsed()) {
            selection.removeText();
            const afterRemove = getCurrentRangeSelection();
            if (!afterRemove) {
              return;
            }
            selection = afterRemove;
          }

          const rangeForBlocks = getCurrentRangeSelection();
          if (!rangeForBlocks) {
            return;
          }

          const anchorNode = rangeForBlocks.anchor.getNode();
          const blockNode = $isScreenplayBlockNode(anchorNode)
            ? anchorNode
            : anchorNode.getParent();

          const splitIntoBlocks =
            $isScreenplayBlockNode(blockNode) &&
            isCollapsedCaretAtEndOfScreenplayBlock(
              blockNode,
              rangeForBlocks.anchor.getNode(),
              rangeForBlocks.anchor.offset,
            );

          if (!splitIntoBlocks) {
            insertPlainChunks(normalized);
            return;
          }

          insertPlainChunks(lines[0] ?? "");

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i] ?? "";
            const currentSelection = getCurrentRangeSelection();
            if (!currentSelection) {
              break;
            }
            const an = currentSelection.anchor.getNode();
            const bn = $isScreenplayBlockNode(an) ? an : an.getParent();
            if (!$isScreenplayBlockNode(bn)) {
              insertPlainChunks(`\n${lines.slice(i).join("\n")}`);
              break;
            }
            const nextType = getNextBlockTypeOnEnter(bn.getBlockType());
            const newBlock = $createScreenplayBlockNode(nextType);
            bn.insertAfter(newBlock);
            newBlock.selectStart();
            insertPlainChunks(line);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const stripText = editor.registerNodeTransform(TextNode, (node) => {
      if (node.getFormat() === 0 && node.getStyle() === "") {
        return;
      }
      const writable = node.getWritable();
      writable.setFormat(0);
      if (writable.getStyle() !== "") {
        writable.setStyle("");
      }
    });

    const stripBlockChrome = editor.registerNodeTransform(ScreenplayBlockNode, (node) => {
      const formatType = node.getFormatType();
      const indent = node.getIndent();
      const textFormat = node.getTextFormat();
      const style = node.getStyle();
      const defaultAlign = formatType === "" || formatType === "start" || formatType === "left";
      if (defaultAlign && indent === 0 && textFormat === 0 && style === "") {
        return;
      }
      const w = node.getWritable();
      if (!defaultAlign) {
        w.setFormat("");
      }
      if (indent !== 0) {
        w.setIndent(0);
      }
      if (textFormat !== 0) {
        w.setTextFormat(0);
      }
      if (style !== "") {
        w.setStyle("");
      }
    });

    return () => {
      removeTextFormat();
      removeElementFormat();
      onPaste();
      stripText();
      stripBlockChrome();
    };
  }, [editor]);

  return null;
}
