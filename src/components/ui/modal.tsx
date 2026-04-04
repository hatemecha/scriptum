"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ModalProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

export function Modal({
  children,
  className,
  description,
  footer,
  onOpenChange,
  open,
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
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
    <div
      className="ui-modal"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className={cn("ui-modal__surface", className)}
        role="dialog"
        aria-modal="true"
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
      >
        <div className="ui-modal__header">
          <div className="ui-modal__heading">
            <p className="section-eyebrow">Modal Base</p>
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
            aria-label="Close dialog"
          >
            Close
          </Button>
        </div>

        <div className="ui-modal__content">{children}</div>
        {footer ? <div className="ui-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
