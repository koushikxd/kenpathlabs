# Architecture

How I built Hallucinated. The product rules are in [PROJECT_SPEC.md](./PROJECT_SPEC.md) and the design tokens in [DESIGN.md](../DESIGN.md).

## Stack

- **Next.js 16** serves the pages, the tRPC API and auth from one app and one deploy. I started from a template with a separate Express server and removed it: one origin means no CORS, no cookie config and one thing to host.
- **tRPC 11** with **React Query** for the API and client cache.
- **Better-Auth 1.7** with email and password, plus the `anonymous` and `username` plugins.
- **Prisma 6** on **Neon** Postgres, locally and in production. The E2E suite runs on its own Docker Postgres.
- **Tailwind 4** with shadcn components shared from `packages/ui`.
- **Vitest** for the game logic, **Playwright** for end to end tests.
- **Turborepo** and **pnpm** workspaces, **Oxlint** and **Oxfmt** in a pre-commit hook, **varlock** for typed env.

## Layout

```
apps/web/
  src/app/
    (dock)/page.tsx            Today
    (dock)/play/page.tsx       The game screen
    (dock)/board/page.tsx      Board
    (dock)/me/page.tsx         Me
    u/[username]/page.tsx      Public profile, server rendered
    api/auth/[...all]/         Better-Auth handler
    api/trpc/[trpc]/           tRPC handler
  src/server/                  db and auth singletons, tRPC context
  src/components/              screens and pieces
  public/anatomy/              the 10 round illustrations (SVG)
  e2e/                         Playwright specs
packages/
  api/src/
    game/                      pure logic, no DB
      clock.ts                 IST days and seasons
      schedule.ts              which rounds play on which day, statement shuffle
      history.ts               streaks, freezes, graph, badges
      ranking.ts               board order and rank badges
    seasons.ts                 season standings and finalization (reads the DB)
    routers/                   game, board, me, profile
  auth/                        Better-Auth config, guest progress merge
  db/                          Prisma schema, migrations, seed scripts
  ui/                          shared shadcn components and tokens
content/rounds.json            the 70 rounds
tools/anatomy/                 scripts that draw the round illustrations
```

Everything about dates and ranking lives in `game/` as pure functions, so I can test every edge case without a database.

## Data model

Better-Auth owns `user`, `session` and `account`. I added `isBot` to `user`. The plugins add `isAnonymous`, `username` and `displayUsername`. The game tables:

```prisma
model Round {
  id         String      @id
  position   Int         @unique
  theme      String
  statements Statement[]
}

model Statement {
  id         String  @id
  roundId    String
  text       String
  isFake     Boolean
  correction String?
  sourceUrl  String?
}

model Attempt {
  id          String   @id @default(cuid())
  userId      String
  day         String                  // "2026-10-13", IST
  roundId     String
  statementId String
  correct     Boolean
  createdAt   DateTime @default(now())

  @@unique([userId, day, roundId])
}

model PointEntry {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String                    // round | perfect | streak | seed
  ref       String                    // "<day>:<roundId>" for round, "<day>" for perfect and streak
  createdAt DateTime @default(now())

  @@unique([userId, reason, ref])
  @@index([createdAt])
}

model Season {
  number      Int      @id
  finalizedAt DateTime @default(now())
}

model SeasonAward {
  seasonNumber Int
  userId       String
  award        String                 // goat | 10x
  rank         Int

  @@id([seasonNumber, userId])
}
```

- `Attempt` has a `day` because rounds repeat once the 14-day schedule loops.
- `PointEntry` is the only place points live. Season and all-time totals are sums over a time range, and the `createdAt` index serves the season board.
- Streaks, freezes, the graph and badges are not stored. I compute them from a user's attempts on every read. A user has at most a few hundred attempt rows, so it is cheap, and the numbers can never drift from the answers.
- Attempts point at rounds and statements with no cascade, so content someone has answered cannot be deleted by accident.

## Time

Procedures read the time only from `ctx.now`, never from `new Date()`. In development, when `ALLOW_TEST_CLOCK=true`, an `x-test-now` header sets it per request. A production build compiles that branch out. This is how the E2E tests reach midnight and the end of a season without waiting.

IST is a fixed +05:30 offset with no daylight saving, so `clock.ts` does plain UTC arithmetic on `YYYY-MM-DD` day keys and never touches `Intl`. Season 1 starts at `LAUNCH`, Monday 12 October 2026 00:00 IST. The season number is the count of whole weeks since then, plus one.

## Schedule and shuffle

`roundPositions(day)` picks the day's 5 rounds by days since launch, modulo the 14-day pool. `statementOrder` shuffles a round's statements with a PRNG (mulberry32) seeded by a hash of `day:roundId`, so every player sees the same order and a reload never reshuffles. Its input is sorted by statement id, because the database has no statement position.

## Answering a round

The client sends `{ roundId, statementId }`. A round's `isFake`, correction and sources only reach the client inside its `result`, after it has been answered.

```
day = today in IST, from ctx.now, never from the client
reject unless roundId is scheduled for day and statementId belongs to it

transaction:
  lock the user row (SELECT ... FOR UPDATE)
  insert attempt, on conflict (userId, day, roundId) do nothing
  if inserted and correct:     +10  (round,   "day:roundId")
  if that was the 5th answer:  +20  (perfect, day) if 5/5
                               +5 × streak, max 25 (streak, day)

return the stored attempt with the reveal
```

- A retried request hits the unique constraint, writes nothing and returns the original result, even if the retry picked a different statement. Point entries are written with `ON CONFLICT DO NOTHING` too, so a reward cannot be granted twice.
- The user lock stops two answers sent at once from different devices from both missing the 5th answer and skipping the day's bonuses. The account merge takes the same lock.
- Attempts and point entries are stamped with `ctx.now`, not the database clock, so under the test clock points land in the faked season.

## Streaks, graph and badges

`computeHistory(attempts, today)` walks forward day by day:

- 5 answers that day: streak + 1. Each time the streak reaches a multiple of 7, earn a freeze while fewer than 2 are held.
- A missed day: use a freeze if there is one, otherwise reset to 0.
- Today, unfinished: skipped, so yesterday's streak stays current until the day ends.

The graph runs from the Monday 19 weeks before this week's Monday up to today, 134 to 140 cells. Badges latch once earned.

## Seasons

Live rankings sum each player's `PointEntry` rows inside the season window. Ties break on who reached the total first (the time of their latest entry), then on user id, so ranks are always distinct. Guests and players with 0 points are left out.

There is no cron job. Before the board or a profile is read, the server finalizes any season that ended at least a minute ago:

```
for each ended season with no Season row, oldest first:
  insert Season(n), on conflict do nothing
  if that inserted a row: write SeasonAward for the final top 10
```

Concurrent requests race on the `Season` primary key, and only the winner writes awards. The one minute wait covers an answer stamped just before the end that is still inside its transaction when the season rolls over.

## Guests and accounts

Every screen with the dock sits behind an `AnonymousSession` gate. The layout reads the session on the server. If there is none, the gate calls `signIn.anonymous()` once and renders the screen when it lands. The public profile is outside the gate, so a shared link creates no user.

Server code reads the session with refresh turned off, and the gate calls `getSession()` once from the browser per load instead. Better-Auth extends a session on read and sets the new cookie on that response. A server-side read throws that response away, so without this the cookie expired 7 days after sign-up, even for someone who played daily, and their guest progress was orphaned.

When a guest signs up or signs in, Better-Auth calls `onLinkAccount` and then deletes the guest user. The callback moves data across first:

```
lock the target user row
for each day the guest played:
  if the target account has no attempts that day:
    move that day's attempts and point entries
```

Moving whole days keeps a day's bonuses consistent with its answers. If the merge fails, Better-Auth keeps the guest user, so nothing is lost. Signing out starts a new guest session before the client cache resets, so no request ever goes out without a session.

## Front end

- **Data**: tRPC through React Query. After an answer the client writes the result into the `game.today` cache straight away, then refetches it in the background for the streak, graph and, after round 5, the day's result.
- **Rendering**: dock screens are client components that share one query cache. The profile page is a server component that calls the same tRPC procedure through a server caller, so it is in the first HTML and works without JavaScript.
- **Countdowns** use the server's time from the response plus the device's elapsed time, so a wrong phone clock does not break them.
- **Motion** is CSS only: the glitch, statement cascade, the cross on a wrong pick and the Play button loop. Transform and opacity only, all off under `prefers-reduced-motion`.
- **Illustrations**: each figure in `public/anatomy/` is generated by a script in `tools/anatomy/figures/` (`node tools/anatomy/build.mjs` rebuilds them). The day's first round id seeds which figure starts, so a day never repeats one and a reload shows the same ones.
- **Sound**: [sensory-ui](https://github.com/SatyamVyas04/sensory-ui) (MIT) is vendored into `src/components/sensory-ui/`. It synthesises sounds with Web Audio.

### Phone performance

I audited a production build on an emulated Pixel 5 with 4x CPU throttling and slow 4G. The biggest win was CSS: Tailwind was scanning every shadcn component in `packages/ui`, used or not. Listing only the components the app imports took it from 30KB to 9KB gzipped and first paint from about 1.8s to 1.45s. Layout shift is 0 on every route, and the reveal animation holds 60fps.

## Content and seeding

- `pnpm db:seed` validates `content/rounds.json` with zod (3 statements, exactly 1 fake, `https` sources on truths, corrections on fakes, no "best", "latest" or "currently") and exits before touching the database if anything fails. It then makes the database mirror the file in one transaction. Re-running it changes nothing.
- `pnpm db:seed:players` creates 20 bot users with no login and gives each a `seed` point entry in the current season. The E2E board specs depend on its exact amounts. It takes an optional date to seed a different season.
- `pnpm db:seed:demo` is what I run on Neon. It creates the same 20 bots and plays each one day by day, with real attempts and point entries scored like `game.answer`, from 20 to 60 days back up to yesterday. Higher-listed bots play more often and more accurately. A re-run carries each bot on from its last played day. Never run both bot seeds on one database: the bots would score twice.
- The bot list lives in `packages/db/src/bots.ts`, shared by both scripts.
- The seed scripts run on Bun, because the generated Prisma client is TypeScript that Node cannot run directly.

## Environment

| Variable                | Local                    | Production      |
| ----------------------- | ------------------------ | --------------- |
| `DATABASE_URL`          | Neon pooled URL          | Neon pooled URL |
| `DATABASE_URL_UNPOOLED` | Neon direct URL          | Neon direct URL |
| `BETTER_AUTH_SECRET`    | any 32+ character string | generated       |
| `BETTER_AUTH_URL`       | `http://localhost:3000`  | the deploy URL  |
| `ALLOW_TEST_CLOCK`      | `false` (E2E sets it)    | unset           |

`neon env pull --file apps/web/.env.local` writes both database URLs (and `NEON_BRANCH`, unused), and Vercel's Neon integration sets the same names, which is why the direct one is `DATABASE_URL_UNPOOLED`. The app queries over the pooled URL through Neon's PgBouncer. Prisma uses the direct one for migrations, since PgBouncer in transaction mode breaks Prisma Migrate. I kept Prisma's own query engine rather than a driver adapter. `NEON_BRANCH` is declared non-sensitive because its value, "production", appears all over the client build and varlock's leak scan would otherwise fail the build.

The schema lives in `apps/web/.env.schema`. varlock validates it and generates a typed `ENV` on `pnpm install`.

## Deploy

Vercel builds `apps/web` (its Root Directory) with `turbo run build`.

- The Prisma client is gitignored, so `@kenpathlabs/db`'s `build` script runs `prisma generate`, and `web`'s `^build` runs it first. That task is uncached in `turbo.json`: Vercel's remote cache restores only declared outputs, and a cache hit would leave the client missing.
- Next's file tracing picks up the query engine from the hints in the generated client, so each DB route ships the engine for the platform that ran `prisma generate`.
- Vercel picks pnpm 9 or 10 for a `lockfileVersion: 9.0` lockfile. pnpm then switches itself to the `packageManager` version (pnpm 11), which `allowBuilds` in `pnpm-workspace.yaml` needs.
- Migrations do not run on deploy. I run `pnpm db:migrate:deploy` against Neon by hand before deploying a schema change.
- `BETTER_AUTH_URL` is the production URL, so sign-in only works on the production deployment, not on previews.

## Testing

Unit tests (Vitest, 70 of them) cover `game/` and the content validator: the IST day boundary, season boundaries, the schedule loop, every streak and freeze case, and ranking ties.

The Playwright suite (15 tests) runs on an emulated Pixel 5 over throttled slow 4G. It covers guest play, the reveal, resume after reload, a double tap and a replayed request not double counting, finishing a day, streaks and freezes across days, sign-up keeping progress, sign-in merging, sign-out, the board, and season awards.

- It needs only Docker and Bun. It creates its own database (`kenpathlabs_e2e`), migrates and seeds it, and starts its own `next dev` on port 3100 with a separate build folder, so it runs beside the normal dev server.
- Each test sets the server clock with `x-test-now`, so midnight and the end of a season are reachable.
- Every test saves a trace and a final screenshot in `apps/web/test-results/`.
- I checked several specs against a deliberately broken app (merge turned off, freezes capped at 0, the attempt conflict guard removed) to make sure they fail.

## Known gaps

- A tab left open across midnight on an unanswered round gets an error until it refetches (on focus or reload).
- Two fresh tabs opened at the same moment on a first visit each create a guest. The later cookie wins.
- `/u/<unknown>` paints nothing until JavaScript runs, because Next 16 renders a segment `notFound()` on the client.
- I measured on emulated phones, not real ones. Safe areas and haptics still need a check on a device.
