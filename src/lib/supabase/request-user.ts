import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";

import { ensureUserProfile, type UserAppProfile } from "@/features/user/profile";

import { createSupabaseServerClient } from "./server";
import type { Database } from "./types";

export type RequestSessionUserContext = {
  supabase: SupabaseClient<Database>;
  user: User | null;
};

export type RequestAppUserContext = RequestSessionUserContext & {
  profile: UserAppProfile | null;
};

export const getRequestSessionUser = cache(async (): Promise<RequestSessionUserContext> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
});

export const getRequestAppUser = cache(async (): Promise<RequestAppUserContext> => {
  const context = await getRequestSessionUser();

  if (!context.user) {
    return {
      ...context,
      profile: null,
    };
  }

  return {
    ...context,
    profile: await ensureUserProfile(context.supabase, context.user),
  };
});
