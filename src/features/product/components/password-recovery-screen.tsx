"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appEnvironment } from "@/config/env";
import { routes } from "@/config/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import styles from "./auth-screen.module.css";

type PasswordRecoveryScreenMode = "request" | "reset";

type PasswordRecoveryScreenProps = {
  mode: PasswordRecoveryScreenMode;
};

export function PasswordRecoveryScreen({ mode }: PasswordRecoveryScreenProps) {
  const isResetMode = mode === "reset";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [formSuccess, setFormSuccess] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function mapRecoveryError(message: string) {
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("email rate limit exceeded") ||
      normalizedMessage.includes("over_email_send_rate_limit")
    ) {
      return "Superaste el límite temporal de correos. Espera unos minutos antes de solicitar otro enlace.";
    }

    return "No pudimos enviar el correo de recuperación. Intenta de nuevo.";
  }

  function buildPasswordResetRedirectUrl() {
    const callbackUrl = new URL(routes.authCallback, appEnvironment.public.appUrl);
    callbackUrl.searchParams.set("next", routes.resetPassword);

    return callbackUrl.toString();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    setFormSuccess(undefined);

    if (!isResetMode) {
      if (email.trim().length === 0) {
        setFormError("Ingresa tu correo electrónico.");
        return;
      }

      setIsSubmitting(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: buildPasswordResetRedirectUrl(),
        });

        if (error) {
          setFormError(mapRecoveryError(error.message));
          return;
        }

        setFormSuccess(
          "Si el correo existe, te enviamos un enlace para restablecer tu contraseña.",
        );
      } catch {
        setFormError("No pudimos iniciar la recuperación. Revisa tu configuración de Supabase.");
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (password.trim().length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) {
        setFormError("No pudimos actualizar la contraseña. Solicita un nuevo enlace.");
        return;
      }

      setPassword("");
      setPasswordConfirmation("");
      setFormSuccess("Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.");
    } catch {
      setFormError("No pudimos actualizar la contraseña. Revisa tu configuración de Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <h1 className={styles.title}>
            {isResetMode ? "Nueva contraseña" : "Recuperar contraseña"}
          </h1>
          <p className={styles.description}>
            {isResetMode
              ? "Crea una contraseña nueva para volver a entrar en tu cuenta."
              : "Te enviaremos un enlace para restablecer el acceso a tu cuenta."}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {isResetMode ? (
            <>
              <Input
                autoComplete="new-password"
                label="Nueva contraseña"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                requiredLabel="Obligatorio"
                type="password"
                value={password}
              />
              <Input
                autoComplete="new-password"
                label="Confirmar contraseña"
                name="passwordConfirmation"
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                required
                requiredLabel="Obligatorio"
                type="password"
                value={passwordConfirmation}
              />
            </>
          ) : (
            <Input
              autoComplete="email"
              label="Correo electrónico"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              requiredLabel="Obligatorio"
              type="email"
              value={email}
            />
          )}

          {formError ? <p className={styles.formError}>{formError}</p> : null}
          {formSuccess ? <p className={styles.formSuccess}>{formSuccess}</p> : null}

          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting
                ? isResetMode
                  ? "Actualizando..."
                  : "Enviando..."
                : isResetMode
                  ? "Guardar contraseña"
                  : "Enviar enlace"}
            </Button>

            <div className={styles.secondaryLinks}>
              <p className={styles.supportText}>
                <span className={styles.splitLink}>
                  <span>¿Ya tienes acceso?</span>
                  <Link href={routes.login} className={styles.secondaryLink}>
                    Iniciar sesión
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
