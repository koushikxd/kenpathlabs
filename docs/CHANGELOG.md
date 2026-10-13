# Changelog

What has shipped, and every place the code departs from `PROJECT_SPEC.md` or `ARCHITECTURE.md`. Where this file and those docs disagree, this file wins.

Newest entry first. One entry per issue:

```md
## #<issue> <title>

Shipped: what now exists that the next issue builds on (procedures, scripts, env vars, data shapes).
Decisions: choices the docs did not cover, each with its reason.
Deviations: where this departs from the spec or architecture, and why.
```

Leave out a heading that has nothing under it.

## #5 Leaderboard order and rank badges

Shipped: `packages/api/src/game/ranking.ts` `rankSeason(totals)` with types `RankBadge` (`"goat" | "10x"`, the same strings as `SeasonAward.award`), `SeasonTotal` (`{ userId, points, reachedAt, isAnonymous }`) and `Ranked<T>`. It is generic, so extra fields (name, username, isBot) pass through. It drops anonymous rows and rows with `points <= 0`, sorts, and adds `rank` and `badge`. Season awards (#12) are `rankSeason(totals).slice(0, 10)` with `badge` as the award.

Decisions:

- Sort order: points descending, then `reachedAt` ascending, then `userId` ascending. The `userId` tiebreak keeps ranks distinct and stable.
- Callers compute `reachedAt` as `max(createdAt)` of the user's entries in the window. Point amounts are always positive, so that is the moment the total was reached, and no running sum is needed.
- Bots are ranked like anyone else. No flag is needed in the function.

## #4 Streaks, freezes, activity graph and badges

Shipped: `packages/api/src/game/history.ts` `computeHistory(attempts, today)` with types `AttemptRecord` (`{ day, correct }`), `GraphCell` (`{ day, correct, frozen }`), `Badge` (`"first-token" | "on-fire" | "perfect-week" | "hallucination-hunter"`) and `History` (`{ currentStreak, longestStreak, freezes, graph, badges }`). Pass every attempt the user has, plus `dayKey(now)`.

Decisions:

- The graph runs from the Monday 19 weeks before this week's Monday up to today, with no future cells: 134 to 140 cells. The first cell is always a Monday.
- An unfinished today is skipped by the streak walk, so yesterday's streak stays current until the day ends. Today's partial correct count still shows in the graph.
- A freeze is earned each time the current streak reaches a multiple of 7, while fewer than 2 are held. A streak rebuilt after a reset earns freezes again.
- Perfect Week needs 7 consecutive calendar days at 5/5. A frozen, partial or imperfect day breaks the run.
- Badges are latched: once earned they stay after the streak is lost.

## #3 Game clock, daily schedule and statement order

Shipped:

- `packages/api/src/game/clock.ts`: `LAUNCH` (2026-10-11T18:30:00Z, Monday 00:00 IST), `LAUNCH_DAY` (`"2026-10-12"`), `dayKey(now)`, `nextDayStart(now)`, `addDays(day, n)`, `daysBetween(from, to)`, `seasonNumber(now)`, `seasonWindow(n)` (returns `{ start, end }`, half-open).
- `packages/api/src/game/schedule.ts`: `ROUNDS_PER_DAY`, `POOL_DAYS`, `roundPositions(day)`, `statementOrder(statements, day, roundId)`.
- Vitest in `packages/api` (`pnpm -F @kenpathlabs/api test`), a turbo `test` task and root `pnpm test`. Tests sit next to the code as `*.test.ts`.

Decisions:

- IST is treated as a fixed +05:30 offset (no DST), so there is no `Intl`. Day keys are `YYYY-MM-DD` strings and their arithmetic is done in UTC.
- Nothing is clamped before launch: `seasonNumber` can return 0 or less, and `roundPositions` uses a non-negative mod.
- `statementOrder` seeds mulberry32 with an FNV-1a hash of `${day}:${roundId}` and sorts by the seeded random keys. It returns a new array and never mutates its input.

## #2 Data model plus anonymous and username auth

Shipped:

- Better-Auth `anonymous()` and `username()` plugins with default options (#10 adds `onLinkAccount`).
- `user` columns `isAnonymous` (nullable, default false), `username` (unique), `displayUsername` and `isBot` (default false).
- Game models in `packages/db/prisma/schema/game.prisma` and the first migration `20261013162245_init`.

Decisions:

- Attempt has FKs to Round and Statement with no cascade. The DB rejects attempts on unknown rounds, and a statement someone has answered cannot be deleted, so the #6 seed must upsert.
- Statement belongs to Round with `onDelete: Cascade`, plus an index on `roundId`.
- SeasonAward has an FK to Season, so finalization must insert `Season(n)` before its awards.
- The season leaderboard index is `PointEntry(createdAt)`. Per-user totals are already served by the `(userId, reason, ref)` unique index.
- Better-Auth is not told about `isBot`. The DB default is enough, and the game reads it through Prisma.
- Game tables keep Prisma's default PascalCase names (`"PointEntry"`, `"Attempt"`), unlike the lowercase Better-Auth tables. Quote them in raw SQL.

Deviations:

- The issue's `curl -X POST localhost:3001/api/auth/sign-in/anonymous` returns 415 on Better-Auth 1.7.3, which requires a JSON body. Use `curl -X POST -H 'content-type: application/json' -d '{}' localhost:3001/api/auth/sign-in/anonymous`.

## #1 Serve tRPC and auth from Next.js, remove the Express server

Shipped:

- `apps/web/src/server/services.ts` exports the `db` and `auth` singletons. `db` is cached on `globalThis` so dev hot reloads reuse one pool. `auth` is not cached, unlike the plan: it holds no connections, so a fresh instance per reload costs nothing.
- `apps/web/src/server/context.ts` exports `createContext(req)`, which returns `{ db, session }`. The dead `auth: null` field is gone from the api `Context`.
- Routes at `app/api/auth/[...all]` (`toNextJsHandler`) and `app/api/trpc/[trpc]` (`fetchRequestHandler`, endpoint `/api/trpc`). Clients use same-origin relative URLs.
- Env keys in `apps/web/.env.schema`: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. `NEXT_PUBLIC_SERVER_URL` and `CORS_ORIGIN` are gone. `packages/db` imports its env from `apps/web`, and the Prisma datasource has `directUrl`.
- `createAuth(env, db)` no longer takes trusted origins or overrides cookies, because everything is same-origin.
- `apps/server`, the AI chat and dashboard pages, the `ai` catalog entry and `@ai-sdk/react`, `ai`, `streamdown` and `next-themes` in web are removed.

Decisions:

- The template `/login` page, sign-in and sign-up forms and user menu stay until #15 and #19 replace them. The header keeps only Home and the user menu, and the forms redirect to `/`.

Deviations:

- Dark mode only, by product owner decision, instead of following the system theme (PROJECT_SPEC, issue #1). `<html class="dark">`, no theme provider, and `<Toaster theme="dark">`. `packages/ui` still depends on `next-themes` for its unused `useTheme` fallback.
