# Architecture

See [PROJECT_SPEC.md](./PROJECT_SPEC.md) for the product rules.

## Stack

- **Next.js 16** on Vercel, serving pages, the tRPC API and auth from one deploy
- **tRPC 11** for the API
- **Better-Auth** with email/password plus the `anonymous` and `username` plugins
- **Prisma 6** with Postgres: Neon in production, Docker locally
- **Tailwind 4** with shared shadcn components in `packages/ui`
- **Vitest** for unit tests, **Playwright** for E2E

## Layout

```
apps/web/
  src/app/
    (dock)/page.tsx            Today
    (dock)/board/page.tsx      Board
    (dock)/me/page.tsx         Me
    u/[username]/page.tsx      Public profile
    api/auth/[...all]/         Better-Auth handler
    api/trpc/[trpc]/           tRPC handler
  e2e/
packages/
  api/src/
    game/                      Pure logic, no DB access
      clock.ts                 IST days, seasons
      schedule.ts              Which rounds play on which day
      history.ts               Streak, freezes, graph, badges
      ranking.ts               Leaderboard order, rank badges
    routers/
  auth/                        Better-Auth config, account merge
  db/                          Prisma schema, seed scripts
  ui/
content/rounds.json
```

Everything date- or ranking-related lives in `game/` as pure functions, so it can be tested without a database.

## Data model

Better-Auth owns `user`, `session` and `account`. We add `isBot` to `user`, plus:

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
  ref       String
  createdAt DateTime @default(now())

  @@unique([userId, reason, ref])
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

- `Attempt` includes `day` because rounds repeat once the 14-day schedule loops.
- `PointEntry` is the only place points live. Season and all-time totals are sums over a time range.
- Streaks, freezes, the graph and milestone badges are not stored. They are computed from a user's attempts on read.

## Answering a round

The client sends `{ roundId, statementId }`. It never receives `isFake` for a round it hasn't answered.

```
day = today in IST (server time, never from the client)
check roundId is scheduled for day and statementId belongs to it

transaction:
  insert attempt, on conflict (userId, day, roundId) do nothing
  if inserted and correct:     +10  (round,   "day:roundId")
  if that was the 5th answer:  +20  (perfect, day) if 5/5
                               +5×streak, max 25 (streak, day)

return the stored attempt with the reveal
```

A retried request hits the unique constraint, writes nothing and returns the same result. The same goes for point entries, so a reward can't be granted twice.

## Streaks

`history.ts` exports one function that takes a user's attempts and returns the current and longest streak, freezes held, the 20-week graph and earned badges. It walks forward day by day:

- 5 answers that day: streak + 1, earn a freeze at every multiple of 7 (max 2)
- missed day: use a freeze if there is one, otherwise reset
- today, unfinished: ignored

A user has at most a few hundred attempt rows, so computing this on every request is cheap and the numbers can't drift.

## Seasons

Season number is the count of whole weeks since the launch Monday, plus one. Live rankings sum each player's `PointEntry` rows inside the season window. Ties break on who reached the total first.

There is no cron job. Before reading the board or a profile, the server finalizes any season that has ended:

```
for each ended season with no Season row:
  insert Season(n)            primary key stops a concurrent request
  write SeasonAward for the final top 10
```

## Anonymous accounts

First visit calls `signIn.anonymous()`. When the user signs up or signs in, Better-Auth calls `onLinkAccount` and then deletes the anonymous user. The callback moves data across first:

```
for each day the anonymous user played:
  if the target account has no attempts that day:
    move that day's attempts and point entries
```

Merging by whole day keeps a day's bonuses consistent with its answers.

## Seeding

- `pnpm db:seed` validates `content/rounds.json` (3 statements, exactly 1 fake, sources on truths, corrections on fakes) and upserts it.
- `pnpm db:seed:players` creates 20 bot users with no login and gives each a `seed` point entry in the current season.

## Environment

| Variable             | Local                    | Production      |
| -------------------- | ------------------------ | --------------- |
| `DATABASE_URL`       | Docker Postgres          | Neon pooled URL |
| `DIRECT_URL`         | same                     | Neon direct URL |
| `BETTER_AUTH_SECRET` | any 32+ character string | generated       |
| `BETTER_AUTH_URL`    | `http://localhost:3001`  | Vercel URL      |

## Testing

Unit tests cover `game/`: the IST day boundary, season boundaries, the schedule loop, every streak and freeze case, and ranking ties.

Playwright runs on an emulated Pixel 5 with a throttled network. It covers anonymous play, the reveal, resume after reload, retries not double-counting, finishing a day, sign-up keeping progress, sign-in merging, the board, and season awards. The server clock can be fixed in tests so day and season boundaries are reachable. Each run saves screenshots and a trace.
