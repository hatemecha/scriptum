# Scriptum

Technical foundation for the `SCRIPTUM` web app.

## Project Goal

Scriptum is a screenplay writing tool focused on being simple, fast, minimal, and professional. This repository contains the current technical foundation and internal product documentation for the app.

## Official Stack (Day 7)

- Next.js 16 with App Router
- React 19
- TypeScript 5 in strict mode
- Lexical as the future editor engine
- ESLint 9 with `eslint-config-next`
- Prettier 3
- npm as the package manager
- Future-compatible architecture for Supabase and Stripe integrations

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

## Environment Variables

The initial setup only requires the public application metadata used by the app shell:

```env
NEXT_PUBLIC_APP_NAME=Scriptum
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Environment rules:

- Use `NEXT_PUBLIC_` only for values that are safe in the client bundle.
- Keep secrets server-only without the public prefix.
- Add every new variable to `.env.example`.
- Centralize environment reads in `src/config/env.ts`.

Planned future integration names:

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
