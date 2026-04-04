# Day 10 Security Base

## Status

Approved on 2026-04-04 for Day 10 of the roadmap.

## Objective

Define the minimum security foundation required before SCRIPTUM begins implementing authentication,
user accounts, and cloud persistence. This day does not write production code—it closes the open
decisions so future phases can implement without ambiguity.

The decisions made here cover:

- the authentication model and how Supabase Auth fits the product,
- how Row Level Security (RLS) isolates user data at the database layer,
- what permissions each authenticated user holds over each table,
- what critical inputs must be validated before reaching persistence,
- how secrets and API keys are managed across client and server,
- what the backup baseline looks like for MVP.

## What Supabase Is

Supabase is a hosted backend platform built on PostgreSQL. It provides:

- **Auth** — registration, login, session management, and JWT tokens out of the box.
- **Database** — a standard PostgreSQL database with a REST and real-time API layer.
- **Row Level Security** — PostgreSQL's native row-access control, which Supabase exposes and
  encourages as the primary permission layer.
- **Storage** — file storage (not used in SCRIPTUM MVP).
- **Edge Functions** — serverless functions (not used in SCRIPTUM MVP).

For SCRIPTUM, Supabase replaces the need to build an auth system, a database API, and a session
layer from scratch. The SCRIPTUM team interacts with Supabase through two official packages:

- `@supabase/supabase-js` — the main Supabase client.
- `@supabase/ssr` — SSR-compatible session helpers for Next.js App Router.

Supabase is accessed through the existing `src/services/` boundary defined in Day 8. No Supabase
SDK call should appear outside of `src/services/` or `src/config/` modules.

## Auth Model

### Authentication Provider

SCRIPTUM V1 uses **email and password** as the only supported authentication method.

- OAuth (Google, GitHub, etc.) is out of scope for V1.
- Magic links are out of scope for V1.
- Phone auth is out of scope for V1.

### Session Management

Sessions are stored in **HTTP-only cookies** using `@supabase/ssr`.

Why cookies instead of `localStorage`:

- Next.js App Router server components and server actions cannot read `localStorage`.
- Cookie-based sessions work across server and client without extra hydration complexity.
- HTTP-only cookies prevent JavaScript access to the session token, reducing XSS exposure.

### Email Verification

Email verification is **not required for V1**. Users can sign up and start writing immediately.

Reason: reducing onboarding friction is a core product principle. Verification can be enabled in a
post-MVP configuration update without changing the auth model.

### Password Recovery

Password recovery is **enabled** via the Supabase built-in password reset flow. The user receives
a reset link by email. No custom implementation is needed for V1.

### Auth Flow Summary

1. User submits register form → call `supabase.auth.signUp()` on the server.
2. Supabase creates an `auth.users` record and returns a session.
3. App creates a `profiles` record using the same UUID as the auth user ID.
4. Session JWT is stored in an HTTP-only cookie via `@supabase/ssr`.
5. On subsequent requests, middleware reads the cookie, refreshes the session if needed, and passes
   the authenticated user to server components and server actions.
6. On logout → call `supabase.auth.signOut()` → cookie cleared.

### Route Protection

The authenticated route group `(authenticated)` must be protected by a Next.js middleware that
checks for a valid session cookie before rendering any route under that group.

Route behavior:

- Unauthenticated request to `/projects` or `/projects/[projectId]` → redirect to `/login`.
- Unauthenticated request to `/settings` → redirect to `/login`.
- Authenticated request to `/login` or `/register` → redirect to `/projects`.

The middleware must not block `/`, `/login`, `/register`, or any static file path.

### SDK Packages Required

The following packages must be installed when Phase 4 begins:

- `@supabase/supabase-js`
- `@supabase/ssr`

They are not installed today. This day only defines the model.

## Row Level Security

### What RLS Is

Row Level Security is a PostgreSQL feature that attaches access conditions to each table. When RLS
is enabled on a table, every query against that table is automatically filtered or rejected based
on the active user's identity.

In Supabase, the active user identity is provided by the JWT in the request. Inside RLS policy
conditions, the function `auth.uid()` returns the authenticated user's UUID, or `null` if the
request is unauthenticated.

RLS is the primary data isolation layer in SCRIPTUM. It enforces ownership at the database level,
independently of application-layer logic.

### RLS Must Be Enabled

All three SCRIPTUM tables must have RLS enabled before any data is inserted:

- `profiles`
- `projects`
- `document_snapshots`

With RLS enabled and no policies defined, all rows are denied by default. Policies must be added
explicitly for each operation.

### Policies by Table

#### `profiles`

| Operation | Action | Condition                  | Rationale                                |
| --------- | ------ | -------------------------- | ---------------------------------------- |
| SELECT    | ALLOW  | `auth.uid() = id`          | Users may only read their own profile    |
| INSERT    | ALLOW  | `auth.uid() = id`          | Users may only create their own profile  |
| UPDATE    | ALLOW  | `auth.uid() = id`          | Users may only update their own profile  |
| DELETE    | DENY   | `false`                    | Hard delete is not allowed; use soft delete |

SQL for profiles:

```sql
alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

No DELETE policy is created. The absence of a DELETE policy denies all deletes when RLS is active.

#### `projects`

| Operation | Action | Condition                                               | Rationale                               |
| --------- | ------ | ------------------------------------------------------- | --------------------------------------- |
| SELECT    | ALLOW  | `auth.uid() = owner_profile_id AND deleted_at IS NULL`  | Users see only their active projects    |
| INSERT    | ALLOW  | `auth.uid() = owner_profile_id`                         | Users create projects owned by themselves |
| UPDATE    | ALLOW  | `auth.uid() = owner_profile_id AND deleted_at IS NULL`  | Users update only their active projects |
| DELETE    | DENY   | `false`                                                 | Hard delete is not allowed; use soft delete |

SQL for projects:

```sql
alter table projects enable row level security;

create policy "projects_select_own_active"
  on projects for select
  using (auth.uid() = owner_profile_id and deleted_at is null);

create policy "projects_insert_own"
  on projects for insert
  with check (auth.uid() = owner_profile_id);

create policy "projects_update_own_active"
  on projects for update
  using (auth.uid() = owner_profile_id and deleted_at is null)
  with check (auth.uid() = owner_profile_id);
```

#### `document_snapshots`

| Operation | Action | Condition                     | Rationale                                |
| --------- | ------ | ----------------------------- | ---------------------------------------- |
| SELECT    | ALLOW  | `auth.uid() = owner_profile_id` | Users read only their own snapshots    |
| INSERT    | ALLOW  | `auth.uid() = owner_profile_id` | Users append their own snapshots       |
| UPDATE    | DENY   | `false`                       | Snapshots are immutable after insert     |
| DELETE    | DENY   | `false`                       | Snapshots are never deleted in MVP       |

SQL for document_snapshots:

```sql
alter table document_snapshots enable row level security;

create policy "snapshots_select_own"
  on document_snapshots for select
  using (auth.uid() = owner_profile_id);

create policy "snapshots_insert_own"
  on document_snapshots for insert
  with check (auth.uid() = owner_profile_id);
```

No UPDATE or DELETE policies are created.

### Service Role Exception

Supabase provides a **service role key** that bypasses RLS entirely. This key is used only in:

- webhook handlers (Stripe events),
- server-side migration scripts,
- admin operations that must act outside user context.

The service role key must never appear in client-side code or be prefixed with `NEXT_PUBLIC_`.

## Permissions Model

SCRIPTUM V1 has one permission tier: **authenticated user**.

There is no admin dashboard, no superuser role, and no per-project membership table. All access
is determined by ownership (`owner_profile_id = auth.uid()`).

An authenticated user may:

- read and update their own profile,
- create, read, and update their own projects,
- create and read their own document snapshots.

An authenticated user may not:

- read or modify another user's profile, projects, or snapshots,
- hard-delete any row from any table,
- mutate an existing snapshot.

An unauthenticated request may not read or write any row in any SCRIPTUM table.

## Input Validation

### Critical Fields

The following fields must be validated before persistence. Validation runs at the application layer
(Server Actions or API routes). RLS and database constraints are not a substitute for this
validation—they are a second line of defense.

#### Auth Fields

| Field          | Rule            | Constraint     | Error Message                              |
| -------------- | --------------- | -------------- | ------------------------------------------ |
| email          | required        | —              | Email is required                          |
| email          | pattern         | RFC 5322 email | Enter a valid email address                |
| email          | max-length      | 320 chars      | Email cannot exceed 320 characters         |
| password       | required        | —              | Password is required                       |
| password       | min-length      | 8 chars        | Password must be at least 8 characters     |
| password       | max-length      | 72 chars       | Password cannot exceed 72 characters       |
| display_name   | max-length      | 100 chars      | Display name cannot exceed 100 characters  |

Why 72 chars for password: bcrypt silently truncates passwords at 72 bytes. Enforcing a 72-char
maximum prevents user confusion when a longer password fails to match after change.

#### Project Fields

| Field       | Rule       | Constraint     | Error Message                            |
| ----------- | ---------- | -------------- | ---------------------------------------- |
| title       | required   | —              | Title is required                        |
| title       | max-length | 200 chars      | Title cannot exceed 200 characters       |
| author      | max-length | 200 chars      | Author cannot exceed 200 characters      |
| description | max-length | 500 chars      | Description cannot exceed 500 characters |
| language    | enum       | see below      | Select a valid language                  |
| status      | enum       | see below      | Select a valid status                    |

Valid language values: `en`, `es`, `fr`, `de`, `pt`, `it`, `other`.

Valid status values: `draft`, `in-progress`, `finished`, `optioned`, `produced`.

#### Document Fields

Document-level validation is already handled by the Day 6 screenplay document model under
`src/features/screenplay/document-validation.ts`. That validation is authoritative. No duplicate
rules are defined here.

### Validation Layer

- Client components may run local validation for fast feedback.
- Server Actions and API routes must always re-validate independently of the client.
- Database constraints enforce last-resort integrity.
- RLS enforces row ownership.

The four layers are independent and additive, not exclusive.

## Secrets Strategy

### Rules

1. Only variables whose values are intentionally safe for browser exposure may use the
   `NEXT_PUBLIC_` prefix.
2. All secrets (Supabase service role key, Stripe secret key, Stripe webhook secret) must remain
   server-only and must never be imported in files that run in the browser.
3. All environment variable access is centralized through `src/config/env.ts`.
4. No feature module or service file reads `process.env` directly.

### Variable Inventory

| Variable                              | Exposure      | Required   | Purpose                                               |
| ------------------------------------- | ------------- | ---------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`                | public        | no         | Display name rendered in the browser                  |
| `NEXT_PUBLIC_APP_URL`                 | public        | no         | App base URL for metadata and redirects               |
| `NEXT_PUBLIC_SUPABASE_URL`            | public        | when auth  | Supabase project URL (safe to expose)                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| public        | when auth  | Supabase anon key (safe because RLS is the auth layer)|
| `SUPABASE_SERVICE_ROLE_KEY`           | server-only   | for admin  | Bypasses RLS; never expose to client                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | public        | Phase 10   | Stripe publishable key for checkout UI                |
| `STRIPE_SECRET_KEY`                   | server-only   | Phase 10   | Stripe secret key for server-side API calls           |
| `STRIPE_WEBHOOK_SECRET`               | server-only   | Phase 10   | Validates Stripe webhook signatures                   |

### Why the Supabase Anon Key Is Safe as Public

The Supabase anon key is designed to be public. It only grants access to the Supabase project
endpoint—it does not bypass authentication or RLS. Every request using the anon key still runs
through the RLS policies defined above. Without a valid JWT (user session), no authenticated rows
are accessible.

The service role key is different: it bypasses RLS entirely and must be treated as a master
credential.

## Backup Policy

### Supabase Managed Backups

Supabase provides automated database backups on all plans:

- **Free tier**: daily backups with 7-day retention.
- **Pro tier**: point-in-time recovery (PITR) with 30-day retention.

No additional backup infrastructure is needed for MVP.

### Application-Level History

The snapshot model defined in Day 9 provides implicit application-level history. Every save
appends a new row to `document_snapshots`. The full screenplay document JSON is stored in each
row. This means:

- every autosave or manual save is individually recoverable without any external tooling,
- rolling back a project to a previous version only requires changing `projects.current_snapshot_id`.

### No Custom Backup Script

A custom backup script or scheduled export job is out of scope for MVP. Supabase managed backups
and the snapshot model together satisfy the MVP recovery baseline.

## Closure

Day 10 is considered closed with these decisions:

- the authentication provider (email/password), session strategy (cookie), and SDK packages
  (`@supabase/supabase-js`, `@supabase/ssr`) are defined,
- route protection behavior is defined,
- RLS is confirmed as the database-layer isolation mechanism,
- RLS policies for `profiles`, `projects`, and `document_snapshots` are specified with SQL,
- the single permission tier (authenticated user) is defined,
- critical input validation fields, rules, and constraints are specified,
- the secrets strategy and full variable inventory are defined,
- the backup baseline (Supabase managed + snapshot model) is confirmed,
- no authentication or RLS code is implemented today—this day closes the decision space only.
