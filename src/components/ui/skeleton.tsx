import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  circle?: boolean;
  height?: CSSProperties["height"];
  radius?: CSSProperties["borderRadius"];
  width?: CSSProperties["width"];
};

export function Skeleton({
  circle = false,
  className,
  height = "1rem",
  radius,
  style,
  width = "100%",
  ...props
}: SkeletonProps) {
  const resolvedRadius = circle ? "999px" : radius;

  return (
    <div
      {...props}
      className={cn("ui-skeleton", className)}
      style={{
        borderRadius: resolvedRadius,
        height,
        width,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
