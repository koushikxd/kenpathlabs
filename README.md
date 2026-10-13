# kenpathlabs

A TypeScript monorepo that combines Next.js, Express, tRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Express** - Fast, unopinionated web framework
- **tRPC** - End-to-end type-safe APIs
- **Node.js** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine, run locally with Docker
- **Authentication** - Better-Auth
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Start a new project from this template

```bash
gh repo create <name> --template koushikxd/assignment-template --private --clone
cd <name>
git grep -lz kenpathlabs | xargs -0 perl -pi -e 's/kenpathlabs/<name>/g'
pnpm install
```

The rename replaces the `kenpathlabs` placeholder everywhere: the root package name, the `@kenpathlabs/*` workspace scope, the lockfile, the Postgres container and database and the page title. Use a lowercase kebab-case name. Commit the result as the first commit.

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

Generate the Prisma client before development, typechecking, or building, including in CI and deployment builds. Run this again after changing the Prisma schema:

```bash
pnpm run db:generate
```

This project uses PostgreSQL with Prisma. Postgres runs in Docker from `packages/db/docker-compose.yml` on port 5432.

1. Start Postgres:

```bash
pnpm run db:start
```

2. Set the env in `apps/web/.env`:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/kenpathlabs
DIRECT_URL=postgresql://postgres:password@localhost:5432/kenpathlabs
BETTER_AUTH_SECRET=<at least 32 characters>
BETTER_AUTH_URL=http://localhost:3001
```

3. Apply the migrations to your database:

```bash
pnpm run db:migrate
```

4. Load the rounds from `content/rounds.json`:

```bash
pnpm run db:seed
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The same app serves the API at `/api/trpc` and auth at `/api/auth`.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@kenpathlabs/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

## Git Hooks and Formatting

Lefthook installs a `pre-commit` hook that runs Oxlint (`--fix`) and Oxfmt over staged
files and re-stages what it fixed. Anything Oxlint cannot fix automatically blocks the
commit.

The hook is installed by the `prepare` script during `pnpm install`, and is skipped
outside a git repository. After `git init`, run `pnpm install` once to install it.

- Run checks manually: `pnpm run check`

## Project Structure

```
kenpathlabs/
├── apps/
│   └── web/         # Next.js app: pages, tRPC and auth routes
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run test`: Run unit tests
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:seed`: Validate `content/rounds.json` and load it into the database
- `pnpm run db:studio`: Open database studio UI
- `pnpm run check`: Run Oxlint and Oxfmt
