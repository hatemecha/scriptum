import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import type { ThemePreference } from "@/lib/theme";

type AppProvidersProps = {
  children: ReactNode;
  initialTheme: ThemePreference;
};

export function AppProviders({ children, initialTheme }: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
