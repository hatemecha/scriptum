import type { SupabaseClient, User } from "@supabase/supabase-js";

import { ensureAuthReadyForDataMutation } from "@/lib/supabase/auth-session";
import { type Database, type Json } from "@/lib/supabase/types";

/** Aligned with `dataArchitectureProfilePlans` in `data-architecture.ts`. */
export const userProfilePlans = ["free", "premium"] as const;
export type UserProfilePlan = (typeof userProfilePlans)[number];

export const editorTipsDetailLevels = ["full", "minimal"] as const;
export type EditorTipsDetailLevel = (typeof editorTipsDetailLevels)[number];

export type UserProfilePreferences = {
  /** UI theme preference for dashboard and chrome */
  theme?: "light" | "dark" | "system";
  /** BCP 47 or short code, e.g. es */
  locale?: string;
  /** Editor glossary + contextual strip (Day 25); false = chrome limpio para usuarios expertos */
  editorTipsEnabled?: boolean;
  /** Con ayudas activas: completo (pistas al escribir) o mínimo (glosario manual, sin franja contextual). */
  editorTipsDetailLevel?: EditorTipsDetailLevel;
  /**
   * Sincronizar al servidor al pulsar Intro en una línea y al retocar el título (debounce).
   * Por defecto desactivado: el usuario guarda con el botón explícito en el editor.
   */
  editorAutosaveEnabled?: boolean;
};

export type UserAppProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  plan: UserProfilePlan;
  preferences: UserProfilePreferences;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type UserProfileRowLike = Omit<
  Database["public"]["Tables"]["profiles"]["Row"],
  "preferences"
> & {
  preferences?: Json | null;
};

const MISSING_PREFERENCES_COLUMN_CODE = "42703";
const MISSING_PREFERENCES_COLUMN_FRAGMENT = "preferences";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePlan(value: string): UserProfilePlan {
  return userProfilePlans.includes(value as UserProfilePlan) ? (value as UserProfilePlan) : "free";
}

export function parseUserProfilePreferences(
  value: Json | null | undefined,
): UserProfilePreferences {
  if (!isRecord(value)) {
    return {};
  }

  const theme = value.theme;
  const locale = value.locale;
  const editorTipsEnabled = value.editorTipsEnabled;
  const editorTipsDetailLevel = value.editorTipsDetailLevel;
  const editorAutosaveEnabled = value.editorAutosaveEnabled;

  return {
    ...(theme === "light" || theme === "dark" || theme === "system" ? { theme } : {}),
    ...(typeof locale === "string" && locale.trim().length > 0 ? { locale: locale.trim() } : {}),
    ...(typeof editorTipsEnabled === "boolean" ? { editorTipsEnabled } : {}),
    ...(editorTipsDetailLevel === "full" || editorTipsDetailLevel === "minimal"
      ? { editorTipsDetailLevel }
      : {}),
    ...(typeof editorAutosaveEnabled === "boolean" ? { editorAutosaveEnabled } : {}),
  };
}

/** Ayudas del editor activas salvo que el usuario las haya desactivado explícitamente. */
export function resolveEditorTipsEnabled(preferences: UserProfilePreferences | undefined): boolean {
  if (!preferences) {
    return true;
  }
  return preferences.editorTipsEnabled !== false;
}

export function resolveEditorTipsDetailLevel(
  preferences: UserProfilePreferences | undefined,
): EditorTipsDetailLevel {
  if (preferences?.editorTipsDetailLevel === "minimal") {
    return "minimal";
  }
  return "full";
}

/** Autoguardado al escribir desactivado salvo que el usuario lo active en Ajustes. */
export function resolveEditorAutosaveEnabled(
  preferences: UserProfilePreferences | undefined,
): boolean {
  return preferences?.editorAutosaveEnabled === true;
}

export function isMissingPreferencesColumnError(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    details?: string;
    hint?: string;
    message?: string;
  };
  const code = typeof candidate.code === "string" ? candidate.code : "";

  if (code !== MISSING_PREFERENCES_COLUMN_CODE) {
    return false;
  }

  const combined = [
    typeof candidate.message === "string" ? candidate.message : "",
    typeof candidate.details === "string" ? candidate.details : "",
    typeof candidate.hint === "string" ? candidate.hint : "",
  ]
    .join(" ")
    .toLowerCase();

  return combined.includes(MISSING_PREFERENCES_COLUMN_FRAGMENT);
}

function createMissingPreferencesColumnError(): Error & { code: string } {
  return Object.assign(new Error("Profile preferences are not available on this server yet."), {
    code: MISSING_PREFERENCES_COLUMN_CODE,
  });
}

export function mapProfileRowToAppProfile(row: UserProfileRowLike): UserAppProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    plan: parsePlan(row.plan),
    preferences: parseUserProfilePreferences(row.preferences ?? null),
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export async function fetchUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserAppProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfileRowToAppProfile(data as UserProfileRowLike);
}

/**
 * Ensures a profile row exists and keeps auth email in sync.
 * Display name is only set on insert (registration metadata or explicit insert); not overwritten here.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<UserAppProfile | null> {
  const existing = await fetchUserProfile(supabase, user.id);

  const authEmail = user.email ?? null;
  const metaNameRaw = user.user_metadata?.display_name;
  const metaName =
    typeof metaNameRaw === "string" && metaNameRaw.trim().length > 0 ? metaNameRaw.trim() : null;

  if (!existing) {
    const now = new Date().toISOString();
    const baseInsert = {
      id: user.id,
      email: authEmail,
      display_name: metaName,
      plan: "free",
      created_at: now,
      updated_at: now,
    } satisfies Database["public"]["Tables"]["profiles"]["Insert"];

    let { data: inserted, error } = await supabase
      .from("profiles")
      .insert({
        ...baseInsert,
        preferences: {},
      })
      .select("*")
      .single();

    if (isMissingPreferencesColumnError(error)) {
      ({ data: inserted, error } = await supabase
        .from("profiles")
        .insert(baseInsert)
        .select("*")
        .single());
    }

    if (error?.code === "23505") {
      return fetchUserProfile(supabase, user.id);
    }

    if (error || !inserted) {
      return null;
    }

    return mapProfileRowToAppProfile(inserted as UserProfileRowLike);
  }

  if (existing.email !== authEmail) {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ email: authEmail })
      .eq("id", user.id)
      .select("*")
      .single();

    if (!error && updated) {
      return mapProfileRowToAppProfile(updated as UserProfileRowLike);
    }
  }

  return existing;
}

export async function updateUserProfileDisplayName(
  supabase: SupabaseClient<Database>,
  userId: string,
  displayName: string,
): Promise<{ profile: UserAppProfile | null; error: Error | null }> {
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return { profile: null, error: new Error("Display name cannot be empty.") };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return { profile: null, error: error ?? new Error("Failed to update profile.") };
  }

  return { profile: mapProfileRowToAppProfile(data as UserProfileRowLike), error: null };
}

export function preferencesPatchToJson(patch: UserProfilePreferences): Json {
  const out: Record<string, Json> = {};
  for (const key of Object.keys(patch) as (keyof UserProfilePreferences)[]) {
    const value = patch[key];
    if (value !== undefined) {
      out[key as string] = value as Json;
    }
  }
  return out;
}

/** PostgREST may return one row as an object or as a single-element array. */
function profileRowFromMergeRpcPayload(data: unknown): UserProfileRowLike | null {
  if (data == null) {
    return null;
  }
  if (Array.isArray(data)) {
    const first = data[0];
    return first && typeof first === "object" ? (first as UserProfileRowLike) : null;
  }
  if (typeof data === "object") {
    return data as UserProfileRowLike;
  }
  return null;
}

function isMergeProfilePreferencesRpcMissing(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = (typeof candidate.message === "string" ? candidate.message : "").toLowerCase();

  return code === "PGRST202" || message.includes("could not find the function");
}

async function mergeUserProfilePreferencesLegacy(
  supabase: SupabaseClient<Database>,
  userId: string,
  patch: UserProfilePreferences,
  current: UserAppProfile,
): Promise<{ profile: UserAppProfile | null; error: Error | null }> {
  const next: UserProfilePreferences = {
    ...current.preferences,
    ...patch,
  };

  const { data, error } = await supabase
    .from("profiles")
    .update({ preferences: next as unknown as Json })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    if (isMissingPreferencesColumnError(error)) {
      return { profile: current, error: createMissingPreferencesColumnError() };
    }

    return { profile: null, error };
  }

  if (!data) {
    return { profile: null, error: new Error("Failed to update preferences.") };
  }

  return { profile: mapProfileRowToAppProfile(data as UserProfileRowLike), error: null };
}

export async function mergeUserProfilePreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  patch: UserProfilePreferences,
): Promise<{ profile: UserAppProfile | null; error: Error | null }> {
  const auth = await ensureAuthReadyForDataMutation(supabase);

  if (!auth.user) {
    return { profile: null, error: auth.error };
  }

  if (auth.user.id !== userId) {
    return { profile: null, error: new Error("Not authenticated.") };
  }

  const user = auth.user;

  const ensured = await ensureUserProfile(supabase, user);
  if (!ensured) {
    return { profile: null, error: new Error("Profile not found.") };
  }

  const patchJson = preferencesPatchToJson(patch);
  if (
    typeof patchJson === "object" &&
    patchJson !== null &&
    !Array.isArray(patchJson) &&
    Object.keys(patchJson).length === 0
  ) {
    return { profile: ensured, error: null };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("merge_profile_preferences", {
    p_patch: patchJson,
  });

  const rpcRow = profileRowFromMergeRpcPayload(rpcData);
  if (!rpcError && rpcRow) {
    return { profile: mapProfileRowToAppProfile(rpcRow), error: null };
  }

  if (!rpcError && !rpcRow) {
    return mergeUserProfilePreferencesLegacy(supabase, userId, patch, ensured);
  }

  if (rpcError && isMissingPreferencesColumnError(rpcError)) {
    return { profile: ensured, error: createMissingPreferencesColumnError() };
  }

  if (rpcError && isMergeProfilePreferencesRpcMissing(rpcError)) {
    return mergeUserProfilePreferencesLegacy(supabase, userId, patch, ensured);
  }

  if (rpcError) {
    const message = (rpcError as { message?: string }).message ?? String(rpcError);
    if (message.includes("Profile not found")) {
      const retryEnsured = await ensureUserProfile(supabase, user);
      if (retryEnsured) {
        const second = await supabase.rpc("merge_profile_preferences", { p_patch: patchJson });
        const secondRow = profileRowFromMergeRpcPayload(second.data);
        if (!second.error && secondRow) {
          return {
            profile: mapProfileRowToAppProfile(secondRow),
            error: null,
          };
        }
      }
    }
    return { profile: null, error: rpcError as Error };
  }

  return { profile: null, error: new Error("Failed to update preferences.") };
}

export async function completeUserOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ profile: UserAppProfile | null; error: Error | null }> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: now })
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    return { profile: null, error: error ?? new Error("Failed to complete onboarding.") };
  }

  return { profile: mapProfileRowToAppProfile(data as UserProfileRowLike), error: null };
}

export function formatProfilePlanLabel(plan: UserProfilePlan): string {
  return plan === "premium" ? "Premium" : "Gratis";
}
