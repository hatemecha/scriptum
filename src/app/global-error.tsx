"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PublicLayout } from "@/components/layout/public-layout";
import { routes } from "@/config/routes";
import { RouteBlueprintPage } from "@/features/architecture/components/route-blueprint-page";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="app-body">
        <PublicLayout>
          <RouteBlueprintPage
            eyebrow="Global / Error boundary"
            title="The application shell failed"
            description="This is the last-resort fallback for provider or app-wide failures. Most UI errors should recover before reaching this boundary."
            status="Global fallback active"
            tone="error"
            sections={[
              {
                items: [
                  "Use route boundaries for route-specific failures.",
                  "Use inline feedback for expected validation and mutation errors.",
                  "Reserve the global fallback for provider, hydration, or shell-level problems.",
                ],
                title: "Escalation rules",
              },
              {
                items: [
                  "Always offer a retry path.",
                  "Always offer a route back to the landing page.",
                  "Keep copy concise so the user understands this is not a data-loss notice by default.",
                ],
                title: "User-facing contract",
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
                  Retry application shell
                </button>
                <Link
                  href={routes.home}
                  className="ui-button"
                  data-size="md"
                  data-variant="secondary"
                >
                  Back to landing
                </Link>
              </>
            }
          />
        </PublicLayout>
      </body>
    </html>
  );
}
