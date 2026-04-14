import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import { PasswordRecoveryScreen } from "@/features/product/components/password-recovery-screen";
import { getRequestSessionUser } from "@/lib/supabase/request-user";

export default async function ForgotPasswordPage() {
  const { user } = await getRequestSessionUser();

  if (user) {
    redirect(routes.projects);
  }

  return <PasswordRecoveryScreen mode="request" />;
}
