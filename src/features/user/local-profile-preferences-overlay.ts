import type { SupabaseClient } from "@supabase/supabase-js";

import { type Database, type Json } from "@/lib/supabase/types";

import {
  mergeUserProfilePreferences,
  parseUserProfilePreferences,
  type UserProfilePreferences,
} from "./profile";

const STORAGE_PREFIX = "scriptum-profile-prefs-overlay:";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function readPreferenceOverlay(userId: string): UserProfilePreferences {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parseUserProfilePreferences(parsed as Json);
  } catch {
    return {};
  }
}

function writePreferenceOverlay(userId: string, prefs: UserProfilePreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  const keys = Object.keys(prefs);
  if (keys.length === 0) {
    window.localStorage.removeItem(storageKey(userId));
    return;
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(prefs));
}

/** Fusiona un parche en la capa local (hasta que el servidor lo confirme). */
export function mergePreferenceOverlay(userId: string, patch: UserProfilePreferences): void {
  const current = readPreferenceOverlay(userId);
  writePreferenceOverlay(userId, { ...current, ...patch });
}

/** Quita de la cola local las claves que ya confirmó el servidor. */
export function stripSyncedPreferenceKeysFromOverlay(
  userId: string,
  syncedPatch: UserProfilePreferences,
): void {
  const current = readPreferenceOverlay(userId);
  const next: Record<string, unknown> = { ...(current as Record<string, unknown>) };
  for (const key of Object.keys(syncedPatch) as (keyof UserProfilePreferences)[]) {
    if (syncedPatch[key] !== undefined) {
      delete next[key as string];
    }
  }
  writePreferenceOverlay(userId, parseUserProfilePreferences(next as Json));
}

export function clearPreferenceOverlay(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(storageKey(userId));
}

export function isLikelyNetworkFailure(error: unknown, browserReportsOnline: boolean): boolean {
  if (!browserReportsOnline) {
    return true;
  }

  if (error == null) {
    return false;
  }

  const err = error as { name?: string; message?: string; code?: string };
  const name = typeof err.name === "string" ? err.name : "";
  const message = typeof err.message === "string" ? err.message : String(error);
  const code = typeof err.code === "string" ? err.code : "";
  const combined = `${name} ${message} ${code}`.toLowerCase();

  return (
    combined.includes("failed to fetch") ||
    combined.includes("networkerror") ||
    combined.includes("network request failed") ||
    combined.includes("load failed") ||
    name === "AuthRetryableFetchError" ||
    code === "ECONNREFUSED" ||
    combined.includes("internet connection appears to be offline")
  );
}

const OFFLINE_SUCCESS_HINT =
  "Cambio aplicado en este dispositivo; se sincronizará con tu cuenta cuando haya conexión.";

export function offlinePreferenceSuccessMessage(): string {
  return OFFLINE_SUCCESS_HINT;
}

/**
 * Intenta persistir en Supabase; si falla por red u offline, encola en localStorage y devuelve `appliedLocallyOnly`.
 */
export async function mergeUserProfilePreferencesResilient(
  supabase: SupabaseClient<Database>,
  userId: string,
  patch: UserProfilePreferences,
): Promise<{
  appliedLocallyOnly: boolean;
  error: Error | null;
}> {
  const online = typeof navigator !== "undefined" && navigator.onLine;

  try {
    const { error } = await mergeUserProfilePreferences(supabase, userId, patch);

    if (!error) {
      stripSyncedPreferenceKeysFromOverlay(userId, patch);
      return { appliedLocallyOnly: false, error: null };
    }

    if (isLikelyNetworkFailure(error, online)) {
      mergePreferenceOverlay(userId, patch);
      return { appliedLocallyOnly: true, error: null };
    }

    return { appliedLocallyOnly: false, error };
  } catch (caught) {
    const err = caught instanceof Error ? caught : new Error(String(caught));
    if (isLikelyNetworkFailure(err, online)) {
      mergePreferenceOverlay(userId, patch);
      return { appliedLocallyOnly: true, error: null };
    }
    return { appliedLocallyOnly: false, error: err };
  }
}

/** Envía la cola local al servidor; en éxito vacía la cola. */
export async function flushPreferenceOverlayToServer(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ ok: boolean }> {
  const pending = readPreferenceOverlay(userId);
  if (Object.keys(pending).length === 0) {
    return { ok: true };
  }

  try {
    const { error } = await mergeUserProfilePreferences(supabase, userId, pending);

    if (!error) {
      clearPreferenceOverlay(userId);
      return { ok: true };
    }

    return { ok: false };
  } catch {
    return { ok: false };
  }
}
