"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";

type ThemePreferenceHydratorProps = {
  /** From `profiles.preferences.theme`; only `light` and `dark` apply (cookie wins for `system` or unset). */
  profileTheme: "dark" | "light" | "system" | undefined;
};

export function ThemePreferenceHydrator({ profileTheme }: ThemePreferenceHydratorProps) {
  const { setThemePreference, themePreference } = useTheme();
  const didApplyProfile = useRef(false);

  useEffect(() => {
    if (didApplyProfile.current) {
      return;
    }
    if (profileTheme !== "light" && profileTheme !== "dark") {
      return;
    }
    didApplyProfile.current = true;
    if (profileTheme !== themePreference) {
      setThemePreference(profileTheme as ThemePreference);
    }
  }, [profileTheme, setThemePreference, themePreference]);

  return null;
}
