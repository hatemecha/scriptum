# Day 7 Technical Decisions

## Status

Approved on 2026-04-04 for Day 7 of the roadmap.

## Consistency Review

The current repository is consistent enough to enter Phase 2.

- `SCRIPTUM.md`, `DESIGN.md`, and the screenplay V1 documents all describe the same MVP: a focused screenplay editor with strict formatting, scene navigation, PDF export, and future offline/cloud support.
- `src/features/screenplay/blocks.ts`, `src/features/screenplay/writing-rules.ts`, `src/features/screenplay/format-rules.ts`, and `src/features/screenplay/document-model.ts` already encode Days 3 to 6 in executable TypeScript, so those decisions are not only documented but implemented.
- The real project scaffold already matches the technical base implied by the roadmap: Next.js, React, TypeScript, npm, ESLint, Prettier, import aliases, and a minimal environment setup.

Non-blocking divergence detected:

- The current visual foundation includes a working dark theme toggle, while `DESIGN.md` keeps a light, paper-first direction as the official MVP default. This is acceptable as a foundation experiment, but dark mode is not part of the Day 7 official product baseline.

## Official Stack

The official web stack for SCRIPTUM V1 is:

- Framework: `Next.js 16` with App Router
- UI runtime: `React 19`
- Language: `TypeScript 5` in strict mode
- Editor foundation: `Lexical`
- Package manager: `npm`

Why this is the official stack:

- It matches the code already initialized in the repository.
- It keeps the project on a modern React + Next.js path without adding migration churn before the editor exists.
- It is a stable base for the planned editor, auth, persistence, and billing phases.

## Final Day 7 Decisions

### Next.js

`Next.js 16` is confirmed as the official application framework.

Rules:

- Use App Router as the default routing model.
- Keep route handlers and server components available for future auth, persistence, and billing flows.
- Do not introduce a parallel Pages Router architecture.

### React

`React 19` is confirmed as the official UI runtime.

Rules:

- Build UI with modern React patterns compatible with the current Next.js version.
- Keep components small, typed, and composable.
- Avoid framework drift toward alternative UI runtimes during V1.

### TypeScript

`TypeScript 5` is confirmed as the official language baseline for V1.

Rules:

- Keep `strict` mode enabled.
- Prefer explicit domain types over `any`.
- Re-evaluate a TypeScript major upgrade only when there is a concrete migration reason, not during core editor implementation.

### Lexical

`Lexical` is confirmed as the official editor engine for the future editor phase.

Rules:

- Lexical is the editor runtime, not the source of truth for the screenplay format.
- The canonical screenplay model remains the internal domain model already defined under `src/features/screenplay/*`.
- Lexical nodes and commands must adapt to the SCRIPTUM block model, not redefine it.

### Future Compatibility with Supabase

Supabase is confirmed as the preferred future backend integration for authentication, persistence, and sync support.

Rules:

- Keep the document model provider-agnostic.
- Isolate Supabase-specific code under service/config boundaries instead of spreading SDK usage across UI code.
- Treat auth, storage, and sync as infrastructure layers around the screenplay domain model.

### Future Compatibility with Stripe

Stripe is confirmed as the preferred future billing provider.

Rules:

- Keep billing logic isolated from the editor and project domain model.
- Future checkout, portal, and webhook code must live behind a billing/service boundary.
- Free and premium rules must remain describable without coupling core writing flows to Stripe objects.

### Package Manager

`npm` is the official package manager for the repository.

Reason:

- The project is already initialized with `package-lock.json`.
- There is no current technical benefit large enough to justify a package-manager migration.

Rule:

- Do not mix lockfiles. Until an explicit migration is approved, use only `npm`.

### Naming Conventions

The official naming conventions are:

- English names only for files, folders, components, symbols, and env vars.
- `kebab-case` for folders and file names.
- `PascalCase` for React components, interfaces, and exported type aliases when they represent named concepts.
- `camelCase` for functions, variables, helpers, and object properties.
- `UPPER_SNAKE_CASE` for env vars and module-level constants.
- Prefix hooks with `use`.
- Keep domain-specific logic under `src/features/*`, shared utilities under `src/lib/*`, config under `src/config/*`, and external integrations under `src/services/*`.

### Environment Variable Strategy

The official environment strategy is:

- `.env.example` is the authoritative template for required and planned variables.
- Only variables explicitly safe for the client may use the `NEXT_PUBLIC_` prefix.
- Secrets must stay server-only and must never be read in client components.
- Environment access must be centralized through config modules, not scattered through the codebase.
- Non-critical local metadata may use safe fallbacks during early setup.
- Critical future integrations such as Supabase and Stripe must fail fast when enabled but misconfigured.

Planned naming baseline:

- Public app shell:
  - `NEXT_PUBLIC_APP_NAME`
  - `NEXT_PUBLIC_APP_URL`
- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Stripe:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

## Future Skills Check

The skills relevant to upcoming roadmap days are already available in the current environment, so no extra installation was required today.

Confirmed available for future work:

- `frontend-skill` for product UI and screen design phases
- `pdf` for PDF export definition and implementation
- `security-best-practices` for security review and secure defaults
- `security-threat-model` for threat modeling and abuse-path analysis

## Closure

Day 7 is considered closed with these decisions:

- the official stack is fixed
- the future integration direction is fixed
- the package manager is fixed
- naming conventions are fixed
- the environment variable strategy is fixed
- no base technical decision remains open for Phase 2
