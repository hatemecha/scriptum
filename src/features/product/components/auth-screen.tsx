"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appEnvironment } from "@/config/env";
import { routes } from "@/config/routes";
import { type AuthViewState } from "@/features/product/view-states";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import styles from "./auth-screen.module.css";

type AuthScreenMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthScreenMode;
  redirectAfterAuth?: string;
  viewState: AuthViewState;
};

type AuthFieldErrors = {
  email?: string;
  name?: string;
  password?: string;
};

export function AuthScreen({
  mode,
  redirectAfterAuth = routes.projects,
  viewState,
}: AuthScreenProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [values, setValues] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>(() =>
    isRegister && viewState === "error" ? { email: "Este correo ya está registrado." } : {},
  );
  const [formError, setFormError] = useState<string | undefined>(
    !isRegister && viewState === "error" ? "Correo o contraseña incorrectos." : undefined,
  );
  const [formSuccess, setFormSuccess] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOffline = viewState === "offline";
  const isForcedLoading = viewState === "loading";
  const isPending = isSubmitting || isForcedLoading;

  function handleFieldChange(field: "email" | "name" | "password", nextValue: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: nextValue,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormError(undefined);
    setFormSuccess(undefined);
  }

  function validateFields(): AuthFieldErrors {
    const nextErrors: AuthFieldErrors = {};

    if (values.email.trim().length === 0) {
      nextErrors.email = "Este campo es obligatorio.";
    } else if (!values.email.includes("@")) {
      nextErrors.email = "Ingresa un correo válido.";
    }

    if (values.password.trim().length === 0) {
      nextErrors.password = "Este campo es obligatorio.";
    } else if (isRegister && values.password.trim().length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (isRegister && values.name.trim().length > 100) {
      nextErrors.name = "El nombre no puede superar los 100 caracteres.";
    }

    return nextErrors;
  }

  function getVerificationRedirectUrl() {
    const callbackUrl = new URL(routes.authCallback, appEnvironment.public.appUrl);
    callbackUrl.searchParams.set("next", routes.projects);

    return callbackUrl.toString();
  }

  function mapAuthenticationError(message: string) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("invalid login credentials")) {
      return "Correo o contraseña incorrectos.";
    }

    if (normalizedMessage.includes("email not confirmed")) {
      return "Debes verificar tu correo antes de iniciar sesión.";
    }

    if (normalizedMessage.includes("already registered")) {
      return "Este correo ya está registrado.";
    }

    if (normalizedMessage.includes("password should be at least")) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (
      normalizedMessage.includes("email rate limit exceeded") ||
      normalizedMessage.includes("over_email_send_rate_limit")
    ) {
      return "Superaste el límite temporal de correos. Espera unos minutos antes de intentar de nuevo.";
    }

    return "No se pudo completar la solicitud. Intenta de nuevo.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateFields();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError(undefined);
      return;
    }

    if (isOffline) {
      setFormError("No se pudo conectar. Intenta de nuevo.");
      setFormSuccess(undefined);
      return;
    }

    setIsSubmitting(true);
    setFormError(undefined);
    setFormSuccess(undefined);

    try {
      const supabase = createSupabaseBrowserClient();
      const email = values.email.trim();
      const password = values.password.trim();

      if (isRegister) {
        const displayName = values.name.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          options: {
            data: displayName.length > 0 ? { display_name: displayName } : undefined,
            emailRedirectTo: getVerificationRedirectUrl(),
          },
          password,
        });

        if (error) {
          const errorMessage = mapAuthenticationError(error.message);

          if (errorMessage === "Este correo ya está registrado.") {
            setFieldErrors((currentErrors) => ({
              ...currentErrors,
              email: errorMessage,
            }));
            return;
          }

          setFormError(errorMessage);
          return;
        }

        if (!data.session) {
          setFormSuccess("Te enviamos un correo para verificar tu cuenta antes de continuar.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setFormError(mapAuthenticationError(error.message));
          return;
        }
      }

      router.replace(redirectAfterAuth);
      router.refresh();
    } catch {
      setFormError("No se pudo completar la solicitud. Revisa tu configuración de Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <h1 className={styles.title}>{isRegister ? "Crea tu cuenta" : "Inicia sesión"}</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {isRegister ? (
            <Input
              autoComplete="name"
              name="name"
              label="Nombre"
              placeholder="Cómo quieres que te llamemos"
              hint="Opcional"
              value={values.name}
              error={fieldErrors.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
            />
          ) : null}

          <Input
            autoComplete="email"
            name="email"
            label="Correo electrónico"
            placeholder="tu@correo.com"
            type="email"
            value={values.email}
            error={fieldErrors.email}
            onChange={(event) => handleFieldChange("email", event.target.value)}
            required
            requiredLabel="Obligatorio"
          />

          <Input
            autoComplete={isRegister ? "new-password" : "current-password"}
            name="password"
            label="Contraseña"
            type="password"
            value={values.password}
            error={fieldErrors.password}
            onChange={(event) => handleFieldChange("password", event.target.value)}
            required
            requiredLabel="Obligatorio"
          />

          {formError ? <p className={styles.formError}>{formError}</p> : null}
          {formSuccess ? <p className={styles.formSuccess}>{formSuccess}</p> : null}

          <div className={styles.actions}>
            <Button type="submit" fullWidth disabled={isPending}>
              {isPending
                ? isRegister
                  ? "Creando cuenta..."
                  : "Iniciando sesión..."
                : isRegister
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </Button>

            <div className={styles.secondaryLinks}>
              {!isRegister ? (
                <Link href={routes.forgotPassword} className={styles.supportLink}>
                  ¿Olvidaste tu contraseña?
                </Link>
              ) : null}

              <p className={styles.supportText}>
                <span className={styles.splitLink}>
                  <span>{isRegister ? "Ya tienes cuenta?" : "No tienes cuenta?"}</span>
                  <Link
                    href={isRegister ? routes.login : routes.register}
                    className={styles.secondaryLink}
                  >
                    {isRegister ? "Iniciar sesión" : "Crear cuenta"}
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </form>

        {isOffline ? (
          <footer className={styles.cardFooter}>
            Hace falta conexión para continuar.
          </footer>
        ) : null}
      </div>
    </section>
  );
}
