import { NextResponse } from "next/server";

import { routes } from "@/config/routes";
import { ensureUserProfile } from "@/features/user/profile";
import { getSafeRedirectPath } from "@/lib/routing/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = getSafeRedirectPath(requestUrl.searchParams.get("next"), routes.projects);
  const redirectUrl = new URL(redirectPath, requestUrl.origin);

  if (!code) {
    redirectUrl.pathname = routes.login;
    redirectUrl.searchParams.set("state", "error");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      redirectUrl.pathname = routes.login;
      redirectUrl.searchParams.set("state", "error");
      return NextResponse.redirect(redirectUrl);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile(supabase, user);
    }

    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.pathname = routes.login;
    redirectUrl.searchParams.set("state", "error");
    return NextResponse.redirect(redirectUrl);
  }
}
