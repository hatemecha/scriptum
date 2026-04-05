const FALLBACK_APP_NAME = "Scriptum";
const FALLBACK_APP_URL = "http://localhost:3000";

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizePublicAppName(): string {
  return normalizeOptionalString(process.env.NEXT_PUBLIC_APP_NAME) ?? FALLBACK_APP_NAME;
}

function normalizePublicAppUrl(): string {
  const configuredUrl = normalizeOptionalString(process.env.NEXT_PUBLIC_APP_URL);

  if (!configuredUrl) {
    return FALLBACK_APP_URL;
  }

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_APP_URL;
  }
}

function normalizeOptionalPublicSupabaseUrl(): string | undefined {
  const configuredUrl = normalizeOptionalString(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!configuredUrl) {
    return undefined;
  }

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function normalizeOptionalPublicSupabasePublishableKey(): string | undefined {
  return normalizeOptionalString(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export const appEnvironment = {
  public: {
    appName: normalizePublicAppName(),
    appUrl: normalizePublicAppUrl(),
    supabase: {
      publishableKey: normalizeOptionalPublicSupabasePublishableKey(),
      url: normalizeOptionalPublicSupabaseUrl(),
    },
  },
} as const;
