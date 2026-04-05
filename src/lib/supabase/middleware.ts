import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { appEnvironment } from "@/config/env";
import { routes } from "@/config/routes";
import { getSafeRedirectPath } from "@/lib/routing/safe-redirect-path";
import { securityBaseProtectedRoutePrefixes } from "@/features/security/security-base";

import { type Database } from "./types";

const authPublicRoutes = new Set<string>([
  routes.login,
  routes.register,
  routes.forgotPassword,
  routes.resetPassword,
]);
const authRedirectRoutes = new Set<string>([routes.login, routes.register, routes.forgotPassword]);

const openPublicRoutes = new Set<string>([routes.home, routes.authCallback]);

function isProtectedRoute(pathname: string): boolean {
  return securityBaseProtectedRoutePrefixes.some(
    (routePrefix) => pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );
}

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
    if (isProtectedRoute(pathname)) {
      return redirectUnauthenticatedToLogin();
    }

    return NextResponse.next({ request });
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
  const isPublicPath = authPublicRoutes.has(pathname) || openPublicRoutes.has(pathname);

  if (!user && isProtectedRoute(pathname)) {
    return redirectUnauthenticatedToLogin();
  }

  if (user && authRedirectRoutes.has(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    const nextRaw = request.nextUrl.searchParams.get("next");
    redirectUrl.pathname = getSafeRedirectPath(nextRaw, routes.projects);
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isPublicPath && !isProtectedRoute(pathname)) {
    return response;
  }

  return response;
}
