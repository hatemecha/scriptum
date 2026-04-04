"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PublicLayout } from "@/components/layout/public-layout";
import { routes } from "@/config/routes";
import { StatePanel } from "@/features/product/components/state-panel";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="app-body">
        <PublicLayout>
          <StatePanel
            eyebrow="Global / Error"
            title="Algo salió mal"
            description="La aplicación encontró un error inesperado."
            secondaryDescription="Recarga la página o vuelve al inicio."
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
                  Recargar página
                </button>
                <Link
                  href={routes.home}
                  className="ui-button"
                  data-size="md"
                  data-variant="secondary"
                >
                  Ir al inicio
                </Link>
              </>
            }
          />
        </PublicLayout>
      </body>
    </html>
  );
}
