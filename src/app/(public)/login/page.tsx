import Link from "next/link";

import { routes } from "@/config/routes";
import {
  RouteBlueprintPage,
  type RouteBlueprintSection,
} from "@/features/architecture/components/route-blueprint-page";

const loginSections: RouteBlueprintSection[] = [
  {
    description: "Authentication forms should stay simple and predictable.",
    items: [
      "Submit through a route-owned mutation boundary instead of a global store.",
      "Keep client validation focused on fast feedback for required fields and email shape.",
      "Map backend auth failures into typed UI errors before rendering them.",
    ],
    title: "Form strategy",
  },
  {
    description: "Only the page owns ephemeral input and pending state.",
    items: [
      "Field values, pending state, and submit disablement remain local to the route.",
      "Session creation escapes through the auth service layer, not through UI components.",
      "No cross-route auth form cache is needed for V1.",
    ],
    title: "State boundary",
  },
  {
    description: "Errors should stay understandable and close to the action.",
    items: [
      "Field-specific issues render inline under the relevant input.",
      "Credential or rate-limit failures render as a form-level message above the submit button.",
      "Toasts remain reserved for transient system feedback, not invalid credentials.",
    ],
    title: "UI error policy",
  },
];

export default function LoginPage() {
  return (
    <RouteBlueprintPage
      eyebrow="Public / Authentication"
      title="Login route blueprint"
      description="The public auth entry point stays inside the lightweight public shell while keeping form state, validation, and auth errors isolated to this route."
      status="Public layout + login form boundary defined"
      sections={loginSections}
      aside={{
        items: [
          "Public routes should not preload editor or dashboard concerns.",
          "The layout owns navigation and framing, not form logic.",
          "Future server actions plug in here without changing the shell.",
        ],
        title: "Layout responsibilities",
      }}
      actions={
        <>
          <Link href={routes.register} className="ui-button" data-size="md" data-variant="primary">
            View register route
          </Link>
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="secondary">
            Back to landing
          </Link>
        </>
      }
    />
  );
}
