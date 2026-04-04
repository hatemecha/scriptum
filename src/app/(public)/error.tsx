"use client";

import Link from "next/link";
import { useEffect } from "react";

import { routes } from "@/config/routes";
import { RouteBlueprintPage } from "@/features/architecture/components/route-blueprint-page";

type PublicErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicErrorPage({ error, reset }: PublicErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteBlueprintPage
      eyebrow="Public / Error boundary"
      title="A public route failed to render"
      description="Recoverable public-route failures stay inside the public shell and present a retry path before escalating to a global fallback."
      status="Public route error strategy active"
      tone="error"
      sections={[
        {
          items: [
            "Content errors remain inside the current public route whenever possible.",
            "The user should always have a retry action plus a way back to the landing page.",
            "Domain-specific errors still belong near the form rather than here.",
          ],
          title: "Recovery rules",
        },
        {
          items: [
            "Inline validation errors do not use this boundary.",
            "Unexpected render or data failures do use this boundary.",
            "Only app-wide failures should reach the global fallback.",
          ],
          title: "Escalation policy",
        },
      ]}
      actions={
        <>
          <button
            type="button"
            className="ui-button"
            data-size="md"
            data-variant="primary"
            onClick={() => reset()}
          >
            Retry public route
          </button>
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="secondary">
            Back to landing
          </Link>
        </>
      }
    />
  );
}
