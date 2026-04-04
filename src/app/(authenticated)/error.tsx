"use client";

import Link from "next/link";
import { useEffect } from "react";

import { routes } from "@/config/routes";
import { RouteBlueprintPage } from "@/features/architecture/components/route-blueprint-page";

type AuthenticatedErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthenticatedErrorPage({ error, reset }: AuthenticatedErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteBlueprintPage
      eyebrow="Authenticated / Error boundary"
      title="An authenticated route failed to render"
      description="Authenticated routes recover in-place whenever possible so the user can stay close to their projects instead of losing context."
      status="Authenticated route error strategy active"
      tone="error"
      sections={[
        {
          items: [
            "Dashboard and settings failures should recover without tearing down the entire app shell.",
            "Editor-specific failures should prefer local recovery before this boundary catches them.",
            "Auth/session failures will eventually redirect from the authenticated group rather than from leaf pages.",
          ],
          title: "Recovery rules",
        },
        {
          items: [
            "Route-level fetch/render failures land here.",
            "Form validation stays inline within the failing feature.",
            "Catastrophic provider failures escalate to the global fallback.",
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
            Retry route
          </button>
          <Link
            href={routes.projects}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Back to projects
          </Link>
        </>
      }
    />
  );
}
