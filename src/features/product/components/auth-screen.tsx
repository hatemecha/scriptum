"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { type AuthViewState } from "@/features/product/view-states";

import styles from "./auth-screen.module.css";

type AuthScreenMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthScreenMode;
  viewState: AuthViewState;
};

type AuthFieldErrors = {
  email?: string;
  name?: string;
  password?: string;
};

export function AuthScreen({ mode, viewState }: AuthScreenProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const submitTimeoutRef = useRef<number | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        window.clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

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
  }

  function validateFields(): AuthFieldErrors {
    const nextErrors: AuthFieldErrors = {};

    if (isRegister && values.name.trim().length === 0) {
      nextErrors.name = "Este campo es obligatorio.";
    }

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

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateFields();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError(undefined);
      return;
    }

    if (isOffline) {
      setFormError("No se pudo conectar. Intenta de nuevo.");
      return;
    }

    if (viewState === "error") {
      if (isRegister) {
        setFieldErrors({
          email: "Este correo ya está registrado.",
        });
      } else {
        setFormError("Correo o contraseña incorrectos.");
      }

      return;
    }

    setIsSubmitting(true);
    submitTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(routes.projects);
      });
    }, 900);
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
              value={values.name}
              error={fieldErrors.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              required
              requiredLabel="Obligatorio"
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
                <Link href={routes.home} className={styles.supportLink}>
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
