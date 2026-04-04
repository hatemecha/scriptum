import type { ReactNode } from "react";

type AuthenticatedRootLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedRootLayout({ children }: AuthenticatedRootLayoutProps) {
  return children;
}
