// ─── Auth Model ───────────────────────────────────────────────────────────────

export const securityBaseAuthProviders = ["email_password"] as const;
export type SecurityBaseAuthProvider = (typeof securityBaseAuthProviders)[number];

export const securityBaseSessionStorages = ["cookie"] as const;
export type SecurityBaseSessionStorage = (typeof securityBaseSessionStorages)[number];

export interface SecurityBaseAuthConfig {
  readonly provider: SecurityBaseAuthProvider;
  readonly sessionStorage: SecurityBaseSessionStorage;
  readonly emailVerificationRequired: boolean;
  readonly passwordRecoveryEnabled: boolean;
  readonly oauthProviders: readonly string[];
  readonly sdkPackages: readonly string[];
}

export const securityBaseAuthConfig: SecurityBaseAuthConfig = {
  provider: "email_password",
  sessionStorage: "cookie",
  emailVerificationRequired: false,
  passwordRecoveryEnabled: true,
  oauthProviders: [],
  sdkPackages: ["@supabase/supabase-js", "@supabase/ssr"],
};

// ─── Route Protection ─────────────────────────────────────────────────────────

export const securityBasePublicRoutes = ["/", "/login", "/register"] as const;
export type SecurityBasePublicRoute = (typeof securityBasePublicRoutes)[number];

export const securityBaseProtectedRoutePrefixes = ["/projects", "/settings"] as const;
export type SecurityBaseProtectedRoutePrefix = (typeof securityBaseProtectedRoutePrefixes)[number];

export interface SecurityBaseRouteRule {
  readonly path: string;
  readonly kind: "public" | "protected-prefix";
  readonly unauthenticatedRedirect: string | null;
  readonly authenticatedRedirect: string | null;
}

export const securityBaseRouteRules: readonly SecurityBaseRouteRule[] = [
  {
    path: "/",
    kind: "public",
    unauthenticatedRedirect: null,
    authenticatedRedirect: null,
  },
  {
    path: "/login",
    kind: "public",
    unauthenticatedRedirect: null,
    authenticatedRedirect: "/projects",
  },
  {
    path: "/register",
    kind: "public",
    unauthenticatedRedirect: null,
    authenticatedRedirect: "/projects",
  },
  {
    path: "/projects",
    kind: "protected-prefix",
    unauthenticatedRedirect: "/login",
    authenticatedRedirect: null,
  },
  {
    path: "/settings",
    kind: "protected-prefix",
    unauthenticatedRedirect: "/login",
    authenticatedRedirect: null,
  },
];

// ─── RLS Policy Spec ──────────────────────────────────────────────────────────

export const securityBaseTables = ["profiles", "projects", "document_snapshots"] as const;
export type SecurityBaseTable = (typeof securityBaseTables)[number];

export const securityBaseRlsOperations = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;
export type SecurityBaseRlsOperation = (typeof securityBaseRlsOperations)[number];

export const securityBaseRlsActions = ["ALLOW", "DENY"] as const;
export type SecurityBaseRlsAction = (typeof securityBaseRlsActions)[number];

export interface SecurityBaseRlsPolicy {
  readonly table: SecurityBaseTable;
  readonly operation: SecurityBaseRlsOperation;
  readonly action: SecurityBaseRlsAction;
  readonly condition: string;
  readonly rationale: string;
}

export const securityBaseRlsPolicies: readonly SecurityBaseRlsPolicy[] = [
  // ── profiles ────────────────────────────────────────────────────────────────

  {
    table: "profiles",
    operation: "SELECT",
    action: "ALLOW",
    condition: "auth.uid() = id",
    rationale: "Users may only read their own profile.",
  },
  {
    table: "profiles",
    operation: "INSERT",
    action: "ALLOW",
    condition: "auth.uid() = id",
    rationale: "Users may only create their own profile row using their auth UUID.",
  },
  {
    table: "profiles",
    operation: "UPDATE",
    action: "ALLOW",
    condition: "auth.uid() = id",
    rationale: "Users may only update their own profile.",
  },
  {
    table: "profiles",
    operation: "DELETE",
    action: "DENY",
    condition: "false",
    rationale: "Hard delete is not allowed. Soft delete via deleted_at is the only removal path.",
  },

  // ── projects ─────────────────────────────────────────────────────────────────

  {
    table: "projects",
    operation: "SELECT",
    action: "ALLOW",
    condition: "auth.uid() = owner_profile_id AND deleted_at IS NULL",
    rationale: "Users see only their active (not soft-deleted) projects.",
  },
  {
    table: "projects",
    operation: "INSERT",
    action: "ALLOW",
    condition: "auth.uid() = owner_profile_id",
    rationale: "Users may only create projects owned by their own profile UUID.",
  },
  {
    table: "projects",
    operation: "UPDATE",
    action: "ALLOW",
    condition: "auth.uid() = owner_profile_id AND deleted_at IS NULL",
    rationale: "Users may only update their own active projects.",
  },
  {
    table: "projects",
    operation: "DELETE",
    action: "DENY",
    condition: "false",
    rationale: "Hard delete is not allowed. Soft delete via deleted_at is the only removal path.",
  },

  // ── document_snapshots ───────────────────────────────────────────────────────

  {
    table: "document_snapshots",
    operation: "SELECT",
    action: "ALLOW",
    condition: "auth.uid() = owner_profile_id",
    rationale: "Users may only read their own snapshots.",
  },
  {
    table: "document_snapshots",
    operation: "INSERT",
    action: "ALLOW",
    condition: "auth.uid() = owner_profile_id",
    rationale: "Users may only append snapshots owned by their own profile UUID.",
  },
  {
    table: "document_snapshots",
    operation: "UPDATE",
    action: "DENY",
    condition: "false",
    rationale: "Snapshots are immutable after insert. No mutation is ever permitted.",
  },
  {
    table: "document_snapshots",
    operation: "DELETE",
    action: "DENY",
    condition: "false",
    rationale: "Snapshots are never deleted in MVP. The append-only history must be preserved.",
  },
];

// ─── Input Validation Rules ───────────────────────────────────────────────────

export const securityBaseValidationKinds = [
  "required",
  "min-length",
  "max-length",
  "pattern",
  "enum",
] as const;
export type SecurityBaseValidationKind = (typeof securityBaseValidationKinds)[number];

export type SecurityBaseValidationConstraint = number | string | readonly string[];

export interface SecurityBaseInputRule {
  readonly entity: string;
  readonly field: string;
  readonly kind: SecurityBaseValidationKind;
  readonly constraint: SecurityBaseValidationConstraint;
  readonly errorMessage: string;
}

export const securityBaseInputRules: readonly SecurityBaseInputRule[] = [
  // ── auth: email ──────────────────────────────────────────────────────────────

  {
    entity: "auth",
    field: "email",
    kind: "required",
    constraint: 1,
    errorMessage: "Email is required.",
  },
  {
    entity: "auth",
    field: "email",
    kind: "pattern",
    constraint: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    errorMessage: "Enter a valid email address.",
  },
  {
    entity: "auth",
    field: "email",
    kind: "max-length",
    constraint: 320,
    errorMessage: "Email cannot exceed 320 characters.",
  },

  // ── auth: password ───────────────────────────────────────────────────────────

  {
    entity: "auth",
    field: "password",
    kind: "required",
    constraint: 1,
    errorMessage: "Password is required.",
  },
  {
    entity: "auth",
    field: "password",
    kind: "min-length",
    constraint: 8,
    errorMessage: "Password must be at least 8 characters.",
  },
  {
    entity: "auth",
    field: "password",
    kind: "max-length",
    constraint: 72,
    errorMessage: "Password cannot exceed 72 characters.",
  },

  // ── auth: display_name ───────────────────────────────────────────────────────

  {
    entity: "auth",
    field: "display_name",
    kind: "max-length",
    constraint: 100,
    errorMessage: "Display name cannot exceed 100 characters.",
  },

  // ── project: title ───────────────────────────────────────────────────────────

  {
    entity: "project",
    field: "title",
    kind: "required",
    constraint: 1,
    errorMessage: "Title is required.",
  },
  {
    entity: "project",
    field: "title",
    kind: "max-length",
    constraint: 200,
    errorMessage: "Title cannot exceed 200 characters.",
  },

  // ── project: author ──────────────────────────────────────────────────────────

  {
    entity: "project",
    field: "author",
    kind: "max-length",
    constraint: 200,
    errorMessage: "Author cannot exceed 200 characters.",
  },

  // ── project: description ─────────────────────────────────────────────────────

  {
    entity: "project",
    field: "description",
    kind: "max-length",
    constraint: 500,
    errorMessage: "Description cannot exceed 500 characters.",
  },

  // ── project: language ────────────────────────────────────────────────────────

  {
    entity: "project",
    field: "language",
    kind: "required",
    constraint: 1,
    errorMessage: "Language is required.",
  },
  {
    entity: "project",
    field: "language",
    kind: "enum",
    constraint: ["en", "es", "fr", "de", "pt", "it", "other"],
    errorMessage: "Select a valid language.",
  },

  // ── project: status ──────────────────────────────────────────────────────────

  {
    entity: "project",
    field: "status",
    kind: "required",
    constraint: 1,
    errorMessage: "Status is required.",
  },
  {
    entity: "project",
    field: "status",
    kind: "enum",
    constraint: ["draft", "in-progress", "finished", "optioned", "produced"],
    errorMessage: "Select a valid status.",
  },
];

// ─── Secrets Strategy ─────────────────────────────────────────────────────────

export const securityBaseSecretExposures = ["public", "server-only"] as const;
export type SecurityBaseSecretExposure = (typeof securityBaseSecretExposures)[number];

export interface SecurityBaseSecretSpec {
  readonly envKey: string;
  readonly exposure: SecurityBaseSecretExposure;
  readonly required: boolean;
  readonly purpose: string;
}

export const securityBaseSecretSpecs: readonly SecurityBaseSecretSpec[] = [
  {
    envKey: "NEXT_PUBLIC_APP_NAME",
    exposure: "public",
    required: false,
    purpose: "Application display name rendered in the browser UI and metadata.",
  },
  {
    envKey: "NEXT_PUBLIC_APP_URL",
    exposure: "public",
    required: false,
    purpose: "Base URL used for metadata, redirects, and open-graph tags.",
  },
  {
    envKey: "NEXT_PUBLIC_SUPABASE_URL",
    exposure: "public",
    required: true,
    purpose: "Supabase project URL. Safe to expose because all access is governed by RLS.",
  },
  {
    envKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    exposure: "public",
    required: true,
    purpose:
      "Supabase anon key. Safe to expose because unauthenticated requests are blocked by RLS.",
  },
  {
    envKey: "SUPABASE_SERVICE_ROLE_KEY",
    exposure: "server-only",
    required: false,
    purpose:
      "Supabase service role key. Bypasses RLS entirely. Used only in webhook handlers and admin scripts.",
  },
  {
    envKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    exposure: "public",
    required: false,
    purpose: "Stripe publishable key for client-side checkout UI. Phase 10 only.",
  },
  {
    envKey: "STRIPE_SECRET_KEY",
    exposure: "server-only",
    required: false,
    purpose: "Stripe secret key for server-side API calls. Phase 10 only.",
  },
  {
    envKey: "STRIPE_WEBHOOK_SECRET",
    exposure: "server-only",
    required: false,
    purpose: "Validates Stripe webhook request signatures. Phase 10 only.",
  },
];

// ─── Backup Policy ────────────────────────────────────────────────────────────

export interface SecurityBaseBackupPolicy {
  readonly provider: string;
  readonly freeTierRetentionDays: number;
  readonly proTierStrategy: string;
  readonly applicationLevelHistory: boolean;
  readonly applicationLevelHistoryMechanism: string;
  readonly customBackupScript: boolean;
}

export const securityBaseBackupPolicy: SecurityBaseBackupPolicy = {
  provider: "supabase",
  freeTierRetentionDays: 7,
  proTierStrategy: "point-in-time-recovery",
  applicationLevelHistory: true,
  applicationLevelHistoryMechanism:
    "Every save appends a row to document_snapshots. Full screenplay JSON is preserved per revision. Recovery requires only updating projects.current_snapshot_id.",
  customBackupScript: false,
};

// ─── Validation ───────────────────────────────────────────────────────────────

export function getSecurityBaseValidationErrors(): string[] {
  const errors: string[] = [];

  // Every table must have a SELECT and INSERT ALLOW policy.
  for (const table of securityBaseTables) {
    const tablePolicies = securityBaseRlsPolicies.filter((policy) => policy.table === table);

    const hasSelectAllow = tablePolicies.some(
      (policy) => policy.operation === "SELECT" && policy.action === "ALLOW",
    );

    if (!hasSelectAllow) {
      errors.push(`Table "${table}" has no ALLOW policy for SELECT.`);
    }

    const hasInsertAllow = tablePolicies.some(
      (policy) => policy.operation === "INSERT" && policy.action === "ALLOW",
    );

    if (!hasInsertAllow) {
      errors.push(`Table "${table}" has no ALLOW policy for INSERT.`);
    }
  }

  // Every DENY policy must use condition "false".
  for (const policy of securityBaseRlsPolicies) {
    if (policy.action === "DENY" && policy.condition !== "false") {
      errors.push(
        `RLS policy "${policy.table} ${policy.operation}" is DENY but condition is not "false".`,
      );
    }
  }

  // No NEXT_PUBLIC_ key may be marked server-only.
  for (const secret of securityBaseSecretSpecs) {
    if (secret.envKey.startsWith("NEXT_PUBLIC_") && secret.exposure === "server-only") {
      errors.push(
        `Secret "${secret.envKey}" uses NEXT_PUBLIC_ prefix but is marked server-only. Rename or change exposure.`,
      );
    }
  }

  // No server-only key may use the NEXT_PUBLIC_ prefix.
  for (const secret of securityBaseSecretSpecs) {
    if (secret.exposure === "server-only" && secret.envKey.startsWith("NEXT_PUBLIC_")) {
      errors.push(
        `Secret "${secret.envKey}" is server-only but has a NEXT_PUBLIC_ prefix. This would expose the secret to the browser.`,
      );
    }
  }

  // No duplicate env keys.
  const seenKeys = new Set<string>();
  for (const secret of securityBaseSecretSpecs) {
    if (seenKeys.has(secret.envKey)) {
      errors.push(`Duplicate secret spec for env key "${secret.envKey}".`);
    }
    seenKeys.add(secret.envKey);
  }

  // For each entity+field combination, min-length must not exceed max-length.
  type FieldKey = string;
  const minLengthByField = new Map<FieldKey, number>();
  const maxLengthByField = new Map<FieldKey, number>();

  for (const rule of securityBaseInputRules) {
    const key: FieldKey = `${rule.entity}.${rule.field}`;

    if (rule.kind === "min-length" && typeof rule.constraint === "number") {
      minLengthByField.set(key, rule.constraint);
    }

    if (rule.kind === "max-length" && typeof rule.constraint === "number") {
      maxLengthByField.set(key, rule.constraint);
    }
  }

  for (const [key, min] of minLengthByField) {
    const max = maxLengthByField.get(key);

    if (max !== undefined && min > max) {
      errors.push(`Input rule for "${key}" has min-length ${min} greater than max-length ${max}.`);
    }
  }

  // Every enum rule must have at least one option.
  for (const rule of securityBaseInputRules) {
    if (rule.kind === "enum") {
      const options = rule.constraint;

      if (!Array.isArray(options) || (options as readonly string[]).length === 0) {
        errors.push(
          `Input rule for "${rule.entity}.${rule.field}" is an enum with no valid options.`,
        );
      }
    }
  }

  // Every route rule must define unauthenticatedRedirect for protected routes.
  for (const routeRule of securityBaseRouteRules) {
    if (routeRule.kind === "protected-prefix" && routeRule.unauthenticatedRedirect === null) {
      errors.push(
        `Route rule for "${routeRule.path}" is protected but has no unauthenticatedRedirect.`,
      );
    }
  }

  return errors;
}
