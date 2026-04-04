"use client";

import Link from "next/link";
import { useEffect } from "react";

import { routes } from "@/config/routes";
import { StatePanel } from "@/features/product/components/state-panel";

type AuthenticatedErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthenticatedErrorPage({ error, reset }: AuthenticatedErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatePanel
      eyebrow="Authenticated / Error"
      title="Algo salio mal"
      description="No pudimos cargar esta pagina."
      secondaryDescription="Intenta recargar o vuelve al inicio."
      tone="danger"
      actions={
        <>
          <button
            type="button"
            className="ui-button"
            data-size="md"
            data-variant="primary"
            onClick={() => reset()}
          >
            Reintentar
          </button>
          <Link
            href={routes.projects}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Ir a proyectos
          </Link>
        </>
      }
    />
  );
}
