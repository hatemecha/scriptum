"use client";

import dynamic from "next/dynamic";

// Client-only: in-IDE browser tooling can inject data-cursor-ref before hydrate on this link-heavy page.
const PrototypeMap = dynamic(
  () => import("./prototype-map").then((mod) => ({ default: mod.PrototypeMap })),
  {
    loading: () => (
      <div
        style={{
          fontFamily: "var(--font-ui)",
          padding: "var(--space-6)",
          color: "var(--color-fg-muted)",
        }}
      >
        Cargando mapa del prototipo...
      </div>
    ),
    ssr: false,
  },
);

export function PrototypeMapLoader() {
  return <PrototypeMap />;
}
