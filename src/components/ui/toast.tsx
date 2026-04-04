"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type ToastTone = "error" | "info" | "success" | "warning";

type ToastRecord = {
  description?: string;
  id: string;
  title: string;
  tone: ToastTone;
};

type ShowToastOptions = {
  description?: string;
  duration?: number;
  title: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (options: ShowToastOptions) => string;
};

const MAX_VISIBLE_TOASTS = 3;
const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

function getDefaultToastDuration(tone: ToastTone): number {
  switch (tone) {
    case "success":
      return 3000;
    case "warning":
    case "error":
      return 5000;
    default:
      return 4000;
  }
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextToastId = useRef(0);
  const timeoutIds = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const activeTimeoutIds = timeoutIds.current;

    return () => {
      for (const timeoutId of activeTimeoutIds.values()) {
        window.clearTimeout(timeoutId);
      }

      activeTimeoutIds.clear();
    };
  }, []);

  function dismissToast(id: string) {
    const timeoutId = timeoutIds.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }

  function showToast({ description, duration, title, tone = "info" }: ShowToastOptions): string {
    nextToastId.current += 1;

    const id = `toast-${nextToastId.current}`;
    const resolvedDuration = duration ?? getDefaultToastDuration(tone);

    setToasts((currentToasts) => {
      const nextToasts = [
        ...currentToasts,
        {
          description,
          id,
          title,
          tone,
        },
      ];

      if (nextToasts.length <= MAX_VISIBLE_TOASTS) {
        return nextToasts;
      }

      const trimmedToast = nextToasts[0];
      const trimmedTimeoutId = timeoutIds.current.get(trimmedToast.id);

      if (trimmedTimeoutId) {
        window.clearTimeout(trimmedTimeoutId);
        timeoutIds.current.delete(trimmedToast.id);
      }

      return nextToasts.slice(-MAX_VISIBLE_TOASTS);
    });

    if (resolvedDuration > 0) {
      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, resolvedDuration);

      timeoutIds.current.set(id, timeoutId);
    }

    return id;
  }

  return (
    <ToastContext.Provider
      value={{
        dismissToast,
        showToast,
      }}
    >
      {children}

      <div
        className="toast-viewport"
        aria-atomic="false"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <section
            key={toast.id}
            className="toast"
            data-tone={toast.tone}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <div className="toast__copy">
              <p className="toast__title">{toast.title}</p>

              {toast.description ? <p className="toast__description">{toast.description}</p> : null}
            </div>

            <button
              type="button"
              className="toast__dismiss"
              onClick={() => dismissToast(toast.id)}
              aria-label={`Cerrar notificacion: ${toast.title}`}
            >
              Cerrar
            </button>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
