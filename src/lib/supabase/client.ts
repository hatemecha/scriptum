"use client";

import { createBrowserClient } from "@supabase/ssr";

import { appEnvironment } from "@/config/env";

import { type Database } from "./types";

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
