# Day 9 Data Architecture

## Status

Approved on 2026-04-04 for Day 9 of the roadmap.

## Objective

Define the persistence model for the SCRIPTUM MVP without ambiguity about:

- the main entities,
- user ownership of projects,
- project persistence of screenplay documents,
- profile storage,
- timestamps,
- archive and soft-delete behavior,
- the primary source of truth in cloud persistence.

The model must stay compatible with the Day 6 screenplay document shape and the Day 7 decision to keep future Supabase integration behind clear boundaries.

## Final MVP Persistence Decision

The SCRIPTUM MVP uses three first-class tables:

- `profiles`
- `projects`
- `document_snapshots`

Primary persistence rule:

- The canonical screenplay payload stored in the cloud is the full Day 6 JSON document.
- That payload lives in `document_snapshots.document_data`.
- The currently active persisted version of a project is referenced by `projects.current_snapshot_id`.

This closes the main persistence question for MVP:

- the project row stores ownership, summary metadata, and the pointer to the active snapshot,
- the snapshot row stores the full persisted screenplay document,
- the profile row stores user identity metadata that the product owns beyond auth.

## Main Entities

### `profiles`

Purpose:

- extend the auth user with product-level metadata,
- hold account and onboarding state,
- provide a stable owner id for projects.

Core fields:

- `id`
- `email`
- `display_name`
- `avatar_url`
- `plan`
- `onboarding_completed_at`
- `created_at`
- `updated_at`
- `deleted_at`

Rules:

- `id` equals the authenticated user id from the auth provider.
- `email` is nullable because auth remains the source of truth for login credentials.
- `plan` is product state such as `free` or `premium`.
- `deleted_at` is nullable and reserved for account-level soft delete if needed later.

### `projects`

Purpose:

- represent the user-facing screenplay project,
- hold lightweight metadata for dashboards and access control,
- point to the currently active persisted screenplay snapshot.

Core fields:

- `id`
- `owner_profile_id`
- `title`
- `author`
- `description`
- `language`
- `status`
- `current_snapshot_id`
- `latest_revision`
- `last_edited_at`
- `created_at`
- `updated_at`
- `archived_at`
- `deleted_at`

Rules:

- each project belongs to exactly one profile in MVP,
- one profile can own many projects,
- collaboration is out of scope for MVP and must not distort the schema today,
- `current_snapshot_id` points to the active persisted screenplay snapshot,
- `latest_revision` mirrors the active document revision for fast listing and conflict checks,
- `archived_at` is user-facing archive state,
- `deleted_at` is internal soft delete and keeps recovery possible.

### `document_snapshots`

Purpose:

- persist immutable screenplay revisions,
- keep save history without redesigning later,
- decouple current project metadata from the full document payload.

Core fields:

- `id`
- `project_id`
- `owner_profile_id`
- `document_id`
- `revision`
- `snapshot_kind`
- `document_schema_version`
- `document_data`
- `created_at`

Rules:

- every snapshot belongs to exactly one project,
- snapshot rows are append-only in MVP,
- the active persisted document is selected through `projects.current_snapshot_id`,
- `document_data` stores the full Day 6 `ScreenplayDocument` JSON,
- `revision` must match `document_data.document.revision`,
- `document_id` must match `document_data.document.id`,
- `owner_profile_id` duplicates project ownership intentionally for simpler indexing, auditing, and future RLS.

## Relationship Design

### User ↔ Projects

MVP relationship:

- `profiles (1) -> (N) projects`

Official rule:

- each project has a single owner through `projects.owner_profile_id`,
- each authenticated user may create many projects,
- there is no `project_memberships` table in MVP.

Why this is the correct MVP choice:

- it matches the roadmap scope,
- it simplifies RLS and access isolation,
- it avoids designing collaboration tables before collaboration exists.

Future extension path:

- if collaboration enters later, add `project_memberships` as a new table,
- do not mutate the meaning of `owner_profile_id`.

### Project ↔ Document

MVP relationship:

- `projects (1) -> (N) document_snapshots`

Active document rule:

- `projects.current_snapshot_id` points to one snapshot row,
- that snapshot is the authoritative persisted screenplay version for the project.

Why snapshots instead of a single mutable document row:

- it preserves save history naturally,
- it supports future diffing and restore flows,
- it keeps the full screenplay JSON immutable once written,
- it avoids mixing dashboard metadata updates with document body overwrites.

## Table Design

### `profiles`

Suggested shape:

```sql
profiles (
  id uuid primary key,
  email text null,
  display_name text null,
  avatar_url text null,
  plan text not null default 'free',
  onboarding_completed_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz null
)
```

### `projects`

Suggested shape:

```sql
projects (
  id text primary key,
  owner_profile_id uuid not null references profiles(id),
  title text not null,
  author text null,
  description text null,
  language text not null default 'en',
  status text not null default 'draft',
  current_snapshot_id text null,
  latest_revision integer not null default 0,
  last_edited_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  archived_at timestamptz null,
  deleted_at timestamptz null
)
```

Constraints:

- `current_snapshot_id` must reference a snapshot that belongs to the same project,
- `latest_revision` must be a non-negative integer,
- `deleted_at` and `archived_at` are nullable and independent,
- archived projects remain recoverable and queryable by owner,
- deleted projects are excluded from normal product queries.

### `document_snapshots`

Suggested shape:

```sql
document_snapshots (
  id text primary key,
  project_id text not null references projects(id),
  owner_profile_id uuid not null references profiles(id),
  document_id text not null,
  revision integer not null,
  snapshot_kind text not null,
  document_schema_version integer not null,
  document_data jsonb not null,
  created_at timestamptz not null
)
```

Constraints:

- unique `(project_id, revision)` to prevent duplicate persisted revisions,
- `revision` must be a non-negative integer,
- `document_schema_version` mirrors the JSON schema version for indexed queries and migrations,
- snapshots are immutable after insert.

## Timestamp Strategy

Official timestamp policy:

- all persisted timestamps use `timestamptz`,
- all application payloads serialize timestamps as ISO 8601 UTC strings,
- all tables include `created_at`,
- mutable tables include `updated_at`,
- archive and deletion state use nullable timestamps instead of booleans.

Per table:

- `profiles`: `created_at`, `updated_at`, `deleted_at`
- `projects`: `created_at`, `updated_at`, `last_edited_at`, `archived_at`, `deleted_at`
- `document_snapshots`: `created_at` only

Why snapshot rows omit `updated_at`:

- snapshots are immutable records,
- changing them would blur revision history semantics.

## Archive and Soft Delete Strategy

MVP decision:

- projects support both archive and soft delete,
- snapshots do not expose archive or delete state in MVP,
- profiles reserve soft delete support through `deleted_at`.

Behavior:

- `archived_at` means hidden from the default active project list but fully recoverable,
- `deleted_at` means soft removed from normal product flows,
- archived projects can still keep their current snapshot and history,
- deleting a project does not require mutating historical snapshot rows.

Why both states are justified:

- archive is a user workflow concept,
- soft delete is a safety and recovery concept,
- mixing them into one flag would create ambiguity later.

## Persistence Flow

The MVP save flow is:

1. The user edits the local Day 6 document model.
2. On cloud save, the app writes a new `document_snapshots` row with the full JSON payload.
3. The app updates the owning `projects` row with:
   - `current_snapshot_id`
   - `latest_revision`
   - `title`, `author`, `description`, `language` when needed
   - `last_edited_at`
   - `updated_at`
4. Dashboard queries read from `projects` first.
5. Editor hydration loads the active snapshot referenced by `current_snapshot_id`.

This keeps list views lightweight and editor loads deterministic.

## Validation Criteria

Day 9 is considered closed only if all of the following are true:

- the model supports user accounts, project lists, editor loads, and persisted screenplay saves,
- project ownership is unambiguous,
- the active persisted screenplay version is unambiguous,
- the Day 6 JSON document remains the canonical screenplay payload,
- timestamps and lifecycle states are explicit,
- the schema is compatible with future Supabase RLS and future revision history,
- no uncertainty remains about whether the app persists documents in `projects` or in snapshots.

## Closure

Day 9 is considered closed with these decisions:

- main entities are defined,
- user to project ownership is defined as one-to-many,
- project to document persistence is defined through append-only snapshots,
- `profiles`, `projects`, and `document_snapshots` are specified,
- timestamps are standardized,
- archive and soft delete are separated,
- the primary cloud persistence source of truth is fixed.
