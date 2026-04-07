import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border font-bold",
    "leading-none transition-[background,border-color,color,box-shadow,transform]",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
    "disabled:pointer-events-none disabled:opacity-55",
    "active:translate-y-px",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "border-[var(--control-primary-border)] bg-primary text-primary-foreground shadow-[0_4px_14px_var(--control-primary-shadow)]",
          "hover:bg-[var(--control-primary-hover)] hover:shadow-[0_8px_20px_var(--control-primary-shadow),0_0_0_2px_var(--color-accent-soft)]",
        ].join(" "),
        secondary: [
          "border-[var(--color-accent-soft-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
          "hover:bg-[var(--color-accent-soft-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-accent-soft-strong)]",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-[var(--color-accent-strong)]",
          "hover:bg-[var(--color-accent-soft)] hover:shadow-[inset_0_0_0_1px_var(--color-accent-soft-strong)]",
        ].join(" "),
        success: [
          "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[var(--color-success)] text-[#f4efe8]",
          "hover:bg-[color-mix(in_srgb,var(--color-success)_88%,black)] hover:shadow-[0_8px_20px_rgba(51,98,75,0.18),0_0_0_2px_var(--color-success-soft)]",
        ].join(" "),
        danger: [
          "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-transparent text-destructive",
          "hover:bg-[var(--color-danger-soft)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-danger)_26%,transparent)]",
        ].join(" "),
      },
      size: {
        sm: "min-h-9 px-3 py-2 text-sm",
        md: "min-h-[2.75rem] px-[1.05rem] py-3 text-[1rem]",
        lg: "min-h-12 px-5 py-[0.9rem] text-[1rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type LegacyVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type LegacySize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> &
  VariantProps<typeof buttonVariants> & {
    fullWidth?: boolean;
    isLoading?: boolean;
    leadingAdornment?: ReactNode;
    trailingAdornment?: ReactNode;
    variant?: LegacyVariant;
    size?: LegacySize;
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
    <ButtonPrimitive
      {...props}
      type={type}
      disabled={isDisabled}
      data-size={size}
      data-variant={variant}
      className={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}
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
    </ButtonPrimitive>
  );
}
