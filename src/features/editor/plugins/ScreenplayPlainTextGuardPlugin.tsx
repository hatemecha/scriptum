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

import { ScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";

/**
 * El guión es texto plano: bloques tipados (encabezado, personaje…), sin negrita/subrayado
 * de RichText ni pegado con estilos desde Word. Evita el subrayado “fantasma” (Ctrl+U, formato).
 */
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
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertRawText(text);
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
      const defaultAlign =
        formatType === "" || formatType === "start" || formatType === "left";
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
