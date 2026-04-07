import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = getSupabasePublicConfiguration();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot write response cookies directly.
        }
      },
    },
  });
}
