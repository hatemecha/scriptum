import Link from "next/link";

import { routes } from "@/config/routes";
import { StatePanel } from "@/features/product/components/state-panel";

export default function NotFoundPage() {
  return (
    <StatePanel
      eyebrow="Routing / 404"
      title="Esta ruta no existe"
      description="La página que buscas no está en este flujo."
      secondaryDescription="Vuelve al inicio o abre tus proyectos."
      tone="danger"
      actions={
        <>
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="primary">
            Ir al inicio
          </Link>
          <Link
            href={routes.projects}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Abrir proyectos
          </Link>
        </>
      }
    />
  );
}
