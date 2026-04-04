"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ModalProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function Modal({
  children,
  className,
  closeLabel = "Cerrar modal",
  description,
  eyebrow,
  footer,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  const descriptionId = useId();
  const titleId = useId();
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !surfaceRef.current) {
      return undefined;
    }

    const surfaceElement = surfaceRef.current;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    const focusableElements = getFocusableElements(surfaceElement);
    const firstFocusableElement = focusableElements[0];

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const availableFocusableElements = getFocusableElements(surfaceElement);

      if (availableFocusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = availableFocusableElements[0];
      const lastElement = availableFocusableElements[availableFocusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      (firstFocusableElement ?? surfaceElement).focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  }

  return (
    <div className="ui-modal" role="presentation" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={surfaceRef}
        className={cn("ui-modal__surface", className)}
        role="dialog"
        tabIndex={-1}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
      >
        <div className="ui-modal__header">
          <div className="ui-modal__heading">
            {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
            <h2 className="ui-modal__title" id={titleId}>
              {title}
            </h2>

            {description ? (
              <p className="ui-modal__description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label={closeLabel}
          >
            Cerrar
          </Button>
        </div>

        <div className="ui-modal__content">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
