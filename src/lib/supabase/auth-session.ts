import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Ensures the client has a valid user JWT before RLS-protected writes.
 * Refreshes the session when getUser() is empty (common after access token expiry in long-lived tabs).
 */
export async function ensureAuthReadyForDataMutation(
  supabase: SupabaseClient<Database>,
): Promise<{ user: User } | { user: null; error: Error }> {
  const first = await supabase.auth.getUser();
  let user = first.data.user;
  const getUserError = first.error;

  if (!user) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError) {
      const second = await supabase.auth.getUser();
      user = second.data.user;
    }
  }

  if (!user) {
    return {
      user: null,
      error:
        getUserError instanceof Error ? getUserError : new Error("Not authenticated."),
    };
  }

  return { user };
}
