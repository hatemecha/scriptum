# Day 8 Frontend Architecture

## Status

Approved on 2026-04-04 for Day 8 of the roadmap.

## Objective

Define a frontend structure that can grow without mixing route composition, feature logic, editor state, and UI primitives.

The architecture must support:

- a lightweight public surface,
- an authenticated product surface,
- a dedicated editor workspace shell,
- future auth, persistence, sync, and billing integration,
- clear error and form handling boundaries.

## Official App Tree

```text
src/app
  layout.tsx
  providers.tsx
  global-error.tsx
  not-found.tsx
  (public)/
    layout.tsx
    error.tsx
    page.tsx
    login/page.tsx
    register/page.tsx
  (authenticated)/
    layout.tsx
    error.tsx
    (dashboard)/
      layout.tsx
      projects/page.tsx
      settings/page.tsx
    projects/[projectId]/
      layout.tsx
      page.tsx
  (internal)/
    playground/foundation/page.tsx

src/components
  layout/
    public-layout.tsx
    dashboard-layout.tsx
    editor-layout.tsx
  ui/
    button.tsx
    input.tsx
    modal.tsx
    skeleton.tsx
    toast.tsx

src/features
  marketing/
  screenplay/
  playground/
  architecture/

src/config
  env.ts
  site.ts
  routes.ts

src/services
  future external integrations only
```

## Main Routes

| Route                   | Audience        | Responsibility                                               |
| ----------------------- | --------------- | ------------------------------------------------------------ |
| `/`                     | Public          | Landing and architecture checkpoint                          |
| `/login`                | Public          | Login flow                                                   |
| `/register`             | Public          | Registration flow                                            |
| `/projects`             | Authenticated   | Project list, empty state, entry point after login           |
| `/projects/[projectId]` | Authenticated   | Editor workspace                                             |
| `/settings`             | Authenticated   | Account, plan, and editor preferences                        |
| `/playground/foundation`| Internal        | Visual exploration isolated from product routes              |

## Layout Decisions

### Root layout

- Owns fonts, global CSS, and cross-cutting providers only.
- Must stay free of route-specific UI.

### Public layout

- Wraps landing, login, and register.
- Owns light navigation and framing.
- Must not preload editor or dashboard concerns.

### Authenticated root group

- Reserved for future auth/session enforcement.
- Owns the shared route boundary, not the visual shell.

### Dashboard shell

- Used by `/projects` and `/settings`.
- Owns authenticated navigation and account-level framing.
- Must stay separate from editor-specific chrome.

### Editor shell

- Used only by `/projects/[projectId]`.
- Owns writing-session framing: scene outline rail, status region, export/autosave surface.
- The editor is a separate workspace, not a dashboard tab.

## UI and Logic Separation

### `src/app/*`

- Route composition only.
- Reads params, chooses layouts, and delegates to feature modules.

### `src/components/ui/*`

- Reusable presentational primitives with no domain knowledge.

### `src/components/layout/*`

- Shared route shells and structural wrappers.
- No business logic or provider-specific SDK calls.

### `src/features/*`

- Owns domain behavior, feature-specific UI, selectors, and future commands/actions.
- Editor mechanics, auth feature logic, and project feature logic belong here.

### `src/services/*`

- External providers only.
- Supabase, Stripe, and future persistence adapters must stay here.

### `src/lib/*` and `src/config/*`

- Generic helpers and centralized configuration only.

## State Strategy

- Server-fetched route data belongs to the route boundary and the owning feature.
- Ephemeral UI state stays local to the component or route that uses it.
- Global providers are allowed only for cross-cutting concerns such as theme, toast, and future authenticated session context.
- The editor document session will stay route-local under `/projects/[projectId]`.
- Scene outline, counters, and similar UI should be derived from the canonical screenplay model instead of duplicated stores.

## Form Strategy

- Forms stay feature-local until there is a strong reason to share abstractions.
- Auth routes own their own field state, validation, and submission feedback.
- Settings should prefer multiple small section-based forms instead of one large mutation surface.
- Future server mutations should enter through typed feature actions or server actions, not through layout components.
- Validation must map domain errors into UI-safe field or section errors before rendering.

## UI Error Strategy

- Field and section validation errors render inline near the failing control.
- Recoverable feature failures render inside the current route content area with retry actions.
- Route-level render/data failures use segment `error.tsx` boundaries.
- App-wide shell or provider failures use `global-error.tsx`.
- Unknown routes use `not-found.tsx`.
- Toasts are for transient confirmation or lightweight system feedback, not for primary validation messaging.

## Closure

Day 8 is considered closed with these decisions:

- the app tree is defined,
- main routes are defined,
- public and authenticated shells are defined,
- the editor has a dedicated workspace layout,
- UI, logic, state, forms, and error responsibilities are separated,
- the frontend can now grow without collapsing route concerns into feature logic.
