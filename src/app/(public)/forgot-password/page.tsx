import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { PasswordRecoveryScreen } from "@/features/product/components/password-recovery-screen";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ForgotPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(routes.projects);
  }

  return <PasswordRecoveryScreen mode="request" />;
}
