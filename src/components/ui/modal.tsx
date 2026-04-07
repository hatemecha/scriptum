"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { useId } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        onOpenChange(nextOpen);
      }}
      modal
    >
      {open ? (
        <Dialog.Portal>
          <Dialog.Viewport className="fixed inset-0 isolate z-[1000] grid place-items-center p-[var(--space-5)]">
            <Dialog.Backdrop className="fixed inset-0 z-0 bg-[var(--color-backdrop)] backdrop-blur-[12px]" />
            <Dialog.Popup
              className={cn(
                "ui-modal__surface relative z-[1] max-h-[min(100dvh-2rem,48rem)] overflow-y-auto",
                className,
              )}
              initialFocus
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
            >
              <div className="ui-modal__header">
                <div className="ui-modal__heading">
                  {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}

                  <Dialog.Title className="ui-modal__title" id={titleId}>
                    {title}
                  </Dialog.Title>

                  {description ? (
                    <Dialog.Description className="ui-modal__description" id={descriptionId}>
                      {description}
                    </Dialog.Description>
                  ) : null}
                </div>

                <Dialog.Close
                  type="button"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  aria-label={closeLabel}
                >
                  Cerrar
                </Dialog.Close>
              </div>

              <div className="ui-modal__content">{children}</div>
              {footer ? <div className="ui-modal__footer">{footer}</div> : null}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
