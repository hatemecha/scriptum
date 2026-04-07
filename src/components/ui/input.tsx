import type { InputHTMLAttributes } from "react";
import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  hint?: string;
  label: string;
  requiredLabel?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    error,
    hint,
    id,
    label,
    required,
    requiredLabel = "Required",
    "aria-describedby": ariaDescribedByProp,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [ariaDescribedByProp, hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <div className="ui-field__label-row">
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>

        {required ? <span className="ui-field__meta">{requiredLabel}</span> : null}
      </div>

      <input
        ref={ref}
        {...props}
        id={inputId}
        required={required}
        className={cn(
          "ui-input focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
          className,
        )}
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
});
