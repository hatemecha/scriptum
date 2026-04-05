import { routes } from "@/config/routes";

function isAllowedAppPath(pathname: string): boolean {
  if (pathname === routes.home) {
    return true;
  }

  if (pathname === routes.projects || pathname.startsWith(`${routes.projects}/`)) {
    return true;
  }

  if (pathname === routes.settings || pathname.startsWith(`${routes.settings}/`)) {
    return true;
  }

  return false;
}

/**
 * Sanitizes post-auth redirects: same-origin path only, no open redirects.
 * Query strings and hashes are stripped.
 */
export function getSafeRedirectPath(candidate: string | null | undefined, fallback: string): string {
  if (candidate == null) {
    return fallback;
  }

  const trimmed = candidate.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\\") || trimmed.includes("://") || trimmed.includes("@")) {
    return fallback;
  }

  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;

  if (!pathOnly || pathOnly === "/login" || pathOnly === "/register") {
    return fallback;
  }

  return isAllowedAppPath(pathOnly) ? pathOnly : fallback;
}

export function getSafeRedirectPathFromSearchParam(
  value: string | string[] | undefined,
  fallback: string,
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return getSafeRedirectPath(raw, fallback);
}
