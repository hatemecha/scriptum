import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { BoneyardRegistryHydrator } from "@/components/ui/boneyard-registry-hydrator";
import { ToastProvider } from "@/components/ui/toast";
import type { ThemePreference } from "@/lib/theme";

type AppProvidersProps = {
  children: ReactNode;
  initialTheme: ThemePreference;
};

export function AppProviders({ children, initialTheme }: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <BoneyardRegistryHydrator />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
