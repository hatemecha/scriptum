const FALLBACK_APP_NAME = "Scriptum";
const FALLBACK_APP_URL = "http://localhost:3000";

function readOptionalEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value && value.length > 0 ? value : undefined;
}

function normalizePublicAppName(): string {
  return readOptionalEnvironmentVariable("NEXT_PUBLIC_APP_NAME") ?? FALLBACK_APP_NAME;
}

function normalizePublicAppUrl(): string {
  const configuredUrl = readOptionalEnvironmentVariable("NEXT_PUBLIC_APP_URL");

  if (!configuredUrl) {
    return FALLBACK_APP_URL;
  }

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_APP_URL;
  }
}

export const appEnvironment = {
  public: {
    appName: normalizePublicAppName(),
    appUrl: normalizePublicAppUrl(),
  },
} as const;
