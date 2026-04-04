"use client";

import Link from "next/link";
import { useEffect } from "react";

import { routes } from "@/config/routes";
import { StatePanel } from "@/features/product/components/state-panel";

type PublicErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicErrorPage({ error, reset }: PublicErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatePanel
      eyebrow="Public / Error"
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
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="secondary">
            Ir al inicio
          </Link>
        </>
      }
    />
  );
}
