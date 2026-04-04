"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type ToastTone = "error" | "info" | "success";

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

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

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

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }

  function showToast({
    description,
    duration = 4000,
    title,
    tone = "info",
  }: ShowToastOptions): string {
    nextToastId.current += 1;

    const id = `toast-${nextToastId.current}`;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        description,
        id,
        title,
        tone,
      },
    ]);

    if (duration > 0) {
      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, duration);

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

              {toast.description ? (
                <p className="toast__description">{toast.description}</p>
              ) : null}
            </div>

            <button
              type="button"
              className="toast__dismiss"
              onClick={() => dismissToast(toast.id)}
              aria-label={`Dismiss notification: ${toast.title}`}
            >
              Dismiss
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
