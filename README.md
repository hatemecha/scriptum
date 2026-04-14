# Scriptum

Technical foundation for the `SCRIPTUM` web app.

## Project Goal

Scriptum is a screenplay writing tool focused on being simple, fast, minimal, and professional. This repository contains the current technical foundation and internal product documentation for the app.

## Official Stack (Day 7)

- Next.js 16 with App Router
- React 19
- TypeScript 5 in strict mode
- Lexical as the editor engine
- ESLint 9 with `eslint-config-next`
- Prettier 3
- npm as the package manager
- Supabase Auth + Postgres integration
- Stripe planned for a later phase

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev`: start the local development server
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint with zero warnings allowed
- `npm run lint:fix`: apply automatic ESLint fixes
- `npm run typecheck`: run the TypeScript compiler without emitting files
- `npm run format`: format the repository with Prettier
- `npm run format:check`: validate formatting with Prettier
- `npm run validate:screenplay`: validate the screenplay foundation (blocks, format, writing rules, document model)
- `npm run validate:data-architecture`: validate the data architecture reference graph
- `npm run validate:security-base`: validate the security base specification

## Codex + Supabase MCP

To let Codex inspect and validate the remote Supabase project during audits or implementation work:

1. Add the remote MCP server:

```bash
codex mcp add supabase --url https://mcp.supabase.com/mcp?project_ref=tzgvljgnzogcucqytzsb
```

2. Enable remote MCP clients in `~/.codex/config.toml`:

```toml
[mcp]
remote_mcp_client_enabled = true
```

3. Authenticate:

```bash
codex mcp login supabase
```

4. Verify the connection with `codex mcp list` or `/mcp` inside Codex.

Optional:

```bash
npx skills add supabase/agent-skills
```

Notes:

- This configuration lives on the operator machine, not in this repository.
- Use `http://localhost:3000` for local runtime audits unless `127.0.0.1` is added to Next.js `allowedDevOrigins`.

## Roadmap Audit

Runtime audit helper:

```bash
node scripts/run-roadmap-runtime-audit.mjs
```

Artifacts are written to `agent/audit-artifacts/roadmap-audit-*/`.

## Environment Variables

The app shell requires the public application metadata, and authenticated flows require Supabase:

```env
NEXT_PUBLIC_APP_NAME=Scriptum
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Environment rules:

- Use `NEXT_PUBLIC_` only for values that are safe in the client bundle.
- Keep secrets server-only without the public prefix.
- Add every new variable to `.env.example`.
- Centralize environment reads in `src/config/env.ts`.

Current and planned integration names:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Import Aliases

- `@/*` maps to `src/*`

## Initial Structure

```text
.
|-- agent/
|-- public/
|-- src/
|   |-- app/
|   |-- components/
|   |-- config/
|   |-- features/
|   |-- hooks/
|   |-- lib/
|   |-- services/
|   |-- styles/
|   `-- types/
|-- .env.example
|-- eslint.config.mjs
|-- next.config.ts
|-- package.json
`-- tsconfig.json
```

## Conventions

- Use English names for modules, files, and exported symbols.
- Use `kebab-case` for files and folders.
- Use `PascalCase` for React components and exported domain types.
- Use `camelCase` for functions, variables, and object properties.
- Use `UPPER_SNAKE_CASE` for environment variables and module-level constants.
- Keep modules small and focused.
- Prefer shared utilities under `src/lib` and feature-specific code under `src/features`.
- Keep external integrations isolated under `src/services`.
- Add environment variables to `.env.example` whenever a new integration is introduced.
