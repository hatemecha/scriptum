"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./hover-delay-tip.module.css";

type HoverDelayTipProps = {
  children: ReactElement;
  className?: string;
  content: ReactNode;
  delayMs?: number;
};

export function HoverDelayTip({
  children,
  className,
  content,
  delayMs = 720,
}: HoverDelayTipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  const show = useCallback(() => {
    const el = triggerRef.current;
    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const margin = 10;
    const estWidth = Math.min(296, window.innerWidth - margin * 2);
    const left = Math.max(
      margin,
      Math.min(rect.left, window.innerWidth - estWidth - margin),
    );
    const top = rect.bottom + 8;
    setPosition({ left, top });
    setOpen(true);
  }, []);

  const scheduleShow = useCallback(() => {
    clearTimer();
    timeoutRef.current = window.setTimeout(show, delayMs);
  }, [clearTimer, delayMs, show]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleScrollOrResize() {
      hide();
    }

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [hide, open]);

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(styles.trigger, className)}
        onPointerEnter={scheduleShow}
        onPointerLeave={hide}
      >
        {children}
      </span>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className={styles.popover}
              role="tooltip"
              style={{ left: position.left, top: position.top }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
