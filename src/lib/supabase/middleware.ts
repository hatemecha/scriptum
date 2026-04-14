import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { appEnvironment } from "@/config/env";
import { routes } from "@/config/routes";

import { type Database } from "./types";

function getSupabasePublicConfiguration() {
  const { publishableKey, url } = appEnvironment.public.supabase;

  if (!url || !publishableKey) {
    return undefined;
  }

  return {
    publishableKey,
    url,
  };
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request,
  });

  const supabaseConfig = getSupabasePublicConfiguration();

  const redirectUnauthenticatedToLogin = () => {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = routes.login;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  };

  if (!supabaseConfig) {
    return redirectUnauthenticatedToLogin();
  }

  const supabase = createServerClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) {
    return redirectUnauthenticatedToLogin();
  }

  return response;
}
