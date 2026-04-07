"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { appEnvironment } from "@/config/env";

import { ensureAuthReadyForDataMutation } from "./auth-session";
import { type Database } from "./types";

export type SupabaseBrowserAuth =
  | { ok: true; supabase: SupabaseClient<Database>; user: User }
  | { ok: false; supabase: SupabaseClient<Database>; error: Error };

function getSupabasePublicConfiguration() {
  const { publishableKey, url } = appEnvironment.public.supabase;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).",
    );
  }

  return {
    publishableKey,
    url,
  };
}

export function createSupabaseBrowserClient() {
  const { publishableKey, url } = getSupabasePublicConfiguration();
  return createBrowserClient<Database>(url, publishableKey);
}

/** Browser client plus refreshed session for mutations (preferences, projects, snapshots). */
export async function getSupabaseBrowserClientWithUser(): Promise<SupabaseBrowserAuth> {
  const supabase = createSupabaseBrowserClient();
  const auth = await ensureAuthReadyForDataMutation(supabase);
  if (!auth.user) {
    return { ok: false, supabase, error: auth.error };
  }
  return { ok: true, supabase, user: auth.user };
}
