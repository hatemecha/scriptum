import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "ghost" | "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  isLoading?: boolean;
  leadingAdornment?: ReactNode;
  size?: ButtonSize;
  trailingAdornment?: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  isLoading = false,
  leadingAdornment,
  size = "md",
  trailingAdornment,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...props}
      type={type}
      className={cn("ui-button", fullWidth && "ui-button--full-width", className)}
      data-size={size}
      data-variant={variant}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <span className="ui-button__spinner" aria-hidden="true" />
      ) : leadingAdornment ? (
        <span className="ui-button__adornment" aria-hidden="true">
          {leadingAdornment}
        </span>
      ) : null}

      <span className="ui-button__label">{children}</span>

      {!isLoading && trailingAdornment ? (
        <span className="ui-button__adornment" aria-hidden="true">
          {trailingAdornment}
        </span>
      ) : null}
    </button>
  );
}
