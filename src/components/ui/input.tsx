import type { InputHTMLAttributes } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  hint?: string;
  label: string;
};

export function Input({ className, error, hint, id, label, required, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <div className="ui-field__label-row">
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>

        {required ? <span className="ui-field__meta">Required</span> : null}
      </div>

      <input
        {...props}
        id={inputId}
        required={required}
        className={cn("ui-input", className)}
        data-invalid={Boolean(error)}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
      />

      {error ? (
        <p className="ui-field__message ui-field__message--error" id={errorId}>
          {error}
        </p>
      ) : hint ? (
        <p className="ui-field__message" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
