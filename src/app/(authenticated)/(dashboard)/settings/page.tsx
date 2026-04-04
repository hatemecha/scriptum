import Link from "next/link";

import { routes } from "@/config/routes";
import {
  RouteBlueprintPage,
  type RouteBlueprintSection,
} from "@/features/architecture/components/route-blueprint-page";

const settingsSections: RouteBlueprintSection[] = [
  {
    description: "Settings should be composed as small, independent sections.",
    items: [
      "Each settings section owns one mutation path and one validation surface.",
      "Keep account, plan, and editor preferences separated so failures stay local.",
      "Forms should submit independently instead of blocking the full page.",
    ],
    title: "Form strategy",
  },
  {
    description: "Persisted settings and temporary control state should not be mixed.",
    items: [
      "Server-backed preferences live behind feature actions and typed DTOs.",
      "Temporary toggle state, expanded panels, and pending indicators stay local to the page.",
      "Only cross-app preferences such as theme justify a provider-level state boundary.",
    ],
    title: "State strategy",
  },
  {
    description: "The user should know exactly which settings section failed.",
    items: [
      "Validation and save failures render inline inside the relevant section.",
      "Successful saves can use discreet toasts because the user stays on the page.",
      "Unexpected page-level failures escalate to the authenticated error boundary.",
    ],
    title: "UI error policy",
  },
];

export default function SettingsPage() {
  return (
    <RouteBlueprintPage
      eyebrow="Authenticated / Dashboard"
      title="Settings route blueprint"
      description="Settings live in the dashboard shell, not in the editor shell, so account management never competes with the writing experience."
      status="Dashboard route + section-based forms defined"
      sections={settingsSections}
      aside={{
        items: [
          "Prefer multiple small forms over one large form with unrelated side effects.",
          "Keep plan and account mutations server-owned, not client-derived.",
          "Editor preferences can later share schemas with the editor feature without sharing UI state.",
        ],
        title: "Shell expectations",
      }}
      actions={
        <>
          <Link href={routes.projects} className="ui-button" data-size="md" data-variant="primary">
            Back to projects
          </Link>
          <Link
            href={routes.projectEditor("sample-project")}
            className="ui-button"
            data-size="md"
            data-variant="secondary"
          >
            Open editor shell
          </Link>
        </>
      }
    />
  );
}
