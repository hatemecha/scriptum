import Link from "next/link";

import { routes } from "@/config/routes";
import {
  RouteBlueprintPage,
  type RouteBlueprintSection,
} from "@/features/architecture/components/route-blueprint-page";

const registerSections: RouteBlueprintSection[] = [
  {
    description: "Account creation should stay feature-local and typed.",
    items: [
      "Each field owns its own validation message and accessibility metadata.",
      "Shared auth schemas can live under the future auth feature, not inside route files.",
      "Server-side creation errors should be normalized before they touch the UI.",
    ],
    title: "Form strategy",
  },
  {
    description: "Registration should not introduce a global onboarding store too early.",
    items: [
      "Pending state and temporary password strength hints stay local to the route.",
      "Successful registration can redirect into the authenticated tree without leaking form state.",
      "Onboarding state belongs to the user profile domain later, not to this page.",
    ],
    title: "State boundary",
  },
  {
    description: "Feedback should separate fixable input mistakes from system failures.",
    items: [
      "Inline errors explain what the user must correct right now.",
      "Account-exists or verification errors render as route-level guidance near the form.",
      "Unexpected infrastructure failures escalate to the public route error boundary.",
    ],
    title: "UI error policy",
  },
];

export default function RegisterPage() {
  return (
    <RouteBlueprintPage
      eyebrow="Public / Authentication"
      title="Register route blueprint"
      description="Registration follows the same public-shell discipline as login, with field-level validation, route-local pending state, and future handoff into the authenticated app tree."
      status="Public layout + registration flow boundary defined"
      sections={registerSections}
      aside={{
        items: [
          "Keep onboarding copy and form mechanics in the same route until complexity justifies extraction.",
          "Do not couple registration UI to billing or dashboard state.",
          "Route-level loading and error states must still render inside the public shell.",
        ],
        title: "Layout responsibilities",
      }}
      actions={
        <>
          <Link href={routes.login} className="ui-button" data-size="md" data-variant="primary">
            View login route
          </Link>
          <Link href={routes.home} className="ui-button" data-size="md" data-variant="secondary">
            Back to landing
          </Link>
        </>
      }
    />
  );
}
