import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { ensureUserProfile } from "@/features/user/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthenticatedRootLayoutProps = {
  children: ReactNode;
};

export default async function AuthenticatedRootLayout({ children }: AuthenticatedRootLayoutProps) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(routes.login);
    }

    await ensureUserProfile(supabase, user);
  } catch {
    redirect(routes.login);
  }

  return children;
}
