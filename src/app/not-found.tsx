import Link from "next/link";

import { routes } from "@/config/routes";
import { RouteBlueprintPage } from "@/features/architecture/components/route-blueprint-page";

export default function NotFoundPage() {
  return (
    <RouteBlueprintPage
      eyebrow="Routing / Not found"
      title="This route is outside the defined app tree"
      description="Day 8 fixes the main frontend route tree. If a path does not fit that tree, the user lands here with a clear way back."
      status="404 / Unknown route"
      tone="error"
      sections={[
        {
          items: [
            "Main public routes: landing, login, register.",
            "Main authenticated routes: projects, settings, editor.",
            "Internal route: visual foundation playground.",
          ],
          title: "Defined route groups",
        },
        {
          items: [
            "Unknown routes should fail fast and clearly.",
            "The user should always get a safe path back into the app.",
            "Do not silently redirect every missing route to the landing page.",
          ],
          title: "UX guardrails",
        },
      ]}
      actions={
        <>
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="primary">
            Back to landing
          </Link>
          <Link
            href={routes.projects}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Open projects route
          </Link>
        </>
      }
    />
  );
}
