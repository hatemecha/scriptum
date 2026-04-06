"use client";

import { type LexicalEditor } from "lexical";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type UseSceneScrollSpyOptions = {
  editor: LexicalEditor | null;
  sceneKeys: readonly string[];
  scrollRootRef: RefObject<HTMLElement | null>;
};

/**
 * Escena “visible” según el scroll del lienzo: último encabezado cuya parte superior
 * ha pasado una línea cerca del borde superior del contenedor (patrón tipo TOC).
 * Se recalcula con IntersectionObserver + scroll; barato para cientos de escenas.
 */
function pickScrollActiveSceneKey(
  editor: LexicalEditor,
  sceneKeys: readonly string[],
  root: HTMLElement,
): string | null {
  if (sceneKeys.length === 0) {
    return null;
  }

  const rootRect = root.getBoundingClientRect();
  const lineY = rootRect.top + Math.min(132, Math.max(48, rootRect.height * 0.14));

  let lastPassed: string | null = null;
  for (const key of sceneKeys) {
    const el = editor.getElementByKey(key);
    if (!el) {
      continue;
    }
    const er = el.getBoundingClientRect();
    if (er.top <= lineY && er.bottom >= rootRect.top - 32) {
      lastPassed = key;
    }
  }

  if (lastPassed != null) {
    return lastPassed;
  }

  for (const key of sceneKeys) {
    const el = editor.getElementByKey(key);
    if (!el) {
      continue;
    }
    const er = el.getBoundingClientRect();
    if (er.bottom > rootRect.top && er.top < rootRect.bottom) {
      return key;
    }
  }

  return sceneKeys[0] ?? null;
}

export function useSceneScrollSpy({
  editor,
  sceneKeys,
  scrollRootRef,
}: UseSceneScrollSpyOptions): string | null {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const recompute = useCallback(() => {
    const root = scrollRootRef.current;
    if (!editor || !root || sceneKeys.length === 0) {
      setActiveKey(null);
      return;
    }
    setActiveKey(pickScrollActiveSceneKey(editor, sceneKeys, root));
  }, [editor, sceneKeys, scrollRootRef]);

  const scheduleRecompute = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  }, [recompute]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      recompute();
    });
    return () => {
      cancelAnimationFrame(id);
    };
  }, [recompute]);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!editor || !root || sceneKeys.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      () => {
        scheduleRecompute();
      },
      {
        root,
        rootMargin: "0px",
        threshold: [0, 0.05, 0.25, 0.5, 1],
      },
    );

    for (const key of sceneKeys) {
      const el = editor.getElementByKey(key);
      if (el) {
        observer.observe(el);
      }
    }

    root.addEventListener("scroll", scheduleRecompute, { passive: true });
    window.addEventListener("resize", scheduleRecompute);

    return () => {
      root.removeEventListener("scroll", scheduleRecompute);
      window.removeEventListener("resize", scheduleRecompute);
      observer.disconnect();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [editor, sceneKeys, scheduleRecompute, scrollRootRef]);

  return activeKey;
}
