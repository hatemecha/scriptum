"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type LexicalNode,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $isScreenplayBlockNode, type ScreenplayBlockNode } from "@/features/editor/nodes/ScreenplayBlockNode";
import { type ScreenplayBlockType } from "@/features/screenplay/blocks";
import {
  type ScreenplaySuggestionOption,
  type ScreenplaySuggestionResult,
  resolveScreenplaySuggestions,
} from "@/features/editor/screenplay-suggestions";

import styles from "@/features/editor/components/screenplay-editor.module.css";

function getCaretOffsetInBlock(
  block: ScreenplayBlockNode,
  anchorNode: LexicalNode,
  anchorOffset: number,
): number | null {
  if ($isScreenplayBlockNode(anchorNode) && anchorNode.is(block)) {
    return block.getTextContent().length === 0 ? 0 : null;
  }

  if ($isTextNode(anchorNode)) {
    let offset = 0;
    for (const child of block.getChildren()) {
      if (!$isTextNode(child)) continue;
      if (child.is(anchorNode)) {
        return offset + anchorOffset;
      }
      offset += child.getTextContentSize();
    }
  }

  return null;
}

function getSuggestionContext(editorState: {
  read: (fn: () => void) => void;
}): {
  blockType: ScreenplayBlockType;
  before: string;
  offset: number;
} | null {
  let result: {
    blockType: ScreenplayBlockType;
    before: string;
    offset: number;
  } | null = null;

  editorState.read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const blockNode = $isScreenplayBlockNode(anchorNode)
      ? anchorNode
      : anchorNode.getParent();

    if (!blockNode || !$isScreenplayBlockNode(blockNode)) {
      return;
    }

    const offset = getCaretOffsetInBlock(blockNode, anchorNode, selection.anchor.offset);
    if (offset === null) {
      return;
    }

    const full = blockNode.getTextContent();
    result = {
      blockType: blockNode.getBlockType(),
      before: full.slice(0, offset),
      offset,
    };
  });

  return result;
}

function applySuggestion(
  block: ScreenplayBlockNode,
  replaceFrom: number,
  replaceTo: number,
  value: string,
): void {
  const full = block.getTextContent();
  const next = full.slice(0, replaceFrom) + value + full.slice(replaceTo);
  const writable = block.getWritable();
  for (const child of [...writable.getChildren()]) {
    child.remove();
  }
  if (next.length > 0) {
    writable.append($createTextNode(next));
  }
  const first = writable.getFirstChild();
  if ($isTextNode(first)) {
    const caret = replaceFrom + value.length;
    first.select(caret, caret);
  } else {
    writable.selectStart();
  }
}

export function ScreenplaySuggestionsPlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [menu, setMenu] = useState<{
    result: ScreenplaySuggestionResult;
    selectedIndex: number;
    position: { top: number; left: number };
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);
  const positionRafRef = useRef<number | null>(null);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  const schedulePositionUpdate = useCallback(() => {
    if (typeof window === "undefined") return;
    if (positionRafRef.current !== null) {
      window.cancelAnimationFrame(positionRafRef.current);
    }
    positionRafRef.current = window.requestAnimationFrame(() => {
      positionRafRef.current = null;
      const sel = window.getSelection();
      let top = 0;
      let left = 0;
      if (sel && sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        top = rect.bottom + 6;
        left = rect.left;
        if (rect.width === 0 && rect.height === 0) {
          const root = editor.getRootElement();
          if (root) {
            const r = root.getBoundingClientRect();
            top = r.top + 48;
            left = r.left + 24;
          }
        }
      }
      setMenu((prev) => (prev ? { ...prev, position: { top, left } } : null));
    });
  }, [editor]);

  useEffect(() => {
    return () => {
      if (positionRafRef.current !== null) {
        window.cancelAnimationFrame(positionRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onScroll = () => schedulePositionUpdate();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [menu, schedulePositionUpdate]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const data = getSuggestionContext(editorState);
      if (!data) {
        setMenu(null);
        return;
      }

      const resolved = resolveScreenplaySuggestions(
        data.blockType,
        data.before,
        data.offset,
      );

      if (!resolved || resolved.options.length === 0) {
        setMenu(null);
        return;
      }

      setMenu((prev) => {
        const same =
          prev &&
          prev.result.replaceFrom === resolved.replaceFrom &&
          prev.result.replaceTo === resolved.replaceTo &&
          prev.result.finalizeBlockType === resolved.finalizeBlockType &&
          prev.result.options.length === resolved.options.length &&
          prev.result.options.every(
            (o, i) =>
              o.label === resolved.options[i]?.label && o.value === resolved.options[i]?.value,
          );
        if (same) {
          return prev;
        }
        selectedIndexRef.current = 0;
        return {
          result: resolved,
          selectedIndex: 0,
          position: prev?.position ?? { top: 0, left: 0 },
        };
      });
      schedulePositionUpdate();
    });
  }, [editor, schedulePositionUpdate]);

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menu, closeMenu]);

  const pickOption = useCallback(
    (option: ScreenplaySuggestionOption) => {
      const snap = menu;
      if (!snap) return;
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const anchorNode = selection.anchor.getNode();
        const blockNode = $isScreenplayBlockNode(anchorNode)
          ? anchorNode
          : anchorNode.getParent();
        if (!blockNode || !$isScreenplayBlockNode(blockNode)) return;
        applySuggestion(blockNode, snap.result.replaceFrom, snap.result.replaceTo, option.value);
        if (snap.result.finalizeBlockType) {
          blockNode.setBlockType(snap.result.finalizeBlockType);
        }
      });
      closeMenu();
    },
    [closeMenu, editor, menu],
  );

  useEffect(() => {
    if (!menu) return;

    return editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      (e) => {
        e?.preventDefault();
        const len = menu.result.options.length;
        const next = (selectedIndexRef.current + 1) % len;
        selectedIndexRef.current = next;
        setMenu((m) => (m ? { ...m, selectedIndex: next } : null));
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, menu]);

  useEffect(() => {
    if (!menu) return;

    return editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      (e) => {
        e?.preventDefault();
        const len = menu.result.options.length;
        const next = (selectedIndexRef.current - 1 + len) % len;
        selectedIndexRef.current = next;
        setMenu((m) => (m ? { ...m, selectedIndex: next } : null));
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, menu]);

  useEffect(() => {
    if (!menu) return;

    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (e) => {
        e?.preventDefault();
        const opt = menu.result.options[selectedIndexRef.current];
        if (opt) pickOption(opt);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, menu, pickOption]);

  useEffect(() => {
    if (!menu) return;

    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (e) => {
        e?.preventDefault();
        const opt = menu.result.options[selectedIndexRef.current];
        if (opt) pickOption(opt);
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, menu, pickOption]);

  useEffect(() => {
    if (!menu) return;

    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (e) => {
        e?.preventDefault();
        closeMenu();
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [closeMenu, editor, menu]);

  useEffect(() => {
    if (menu) {
      selectedIndexRef.current = menu.selectedIndex;
    }
  }, [menu]);

  if (!menu || typeof document === "undefined") {
    return null;
  }

  const { result, selectedIndex, position } = menu;

  return createPortal(
    <div
      ref={menuRef}
      className={styles.suggestionMenu}
      style={{ top: position.top, left: position.left }}
      role="listbox"
      aria-label="Sugerencias de guion"
    >
      {result.options.map((opt, index) => (
        <button
          key={`${opt.value}-${index}`}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          className={
            index === selectedIndex
              ? `${styles.suggestionItem} ${styles.suggestionItemActive}`
              : styles.suggestionItem
          }
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => {
            selectedIndexRef.current = index;
            setMenu((m) => (m ? { ...m, selectedIndex: index } : null));
          }}
          onClick={() => pickOption(opt)}
        >
          {opt.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
