import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type AppShellProps = {
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  header: ReactNode;
  mainClassName?: string;
  sidebar: ReactNode;
};

export function AppShell({
  aside,
  children,
  className,
  header,
  mainClassName,
  sidebar,
}: AppShellProps) {
  return (
    <div className={cn("app-shell", className)}>
      <header className="app-shell__header">{header}</header>

      <div className="app-shell__body">
        <aside className="app-shell__sidebar">{sidebar}</aside>
        <main className={cn("app-shell__main", mainClassName)}>{children}</main>

        {aside ? <aside className="app-shell__aside">{aside}</aside> : null}
      </div>
    </div>
  );
}
