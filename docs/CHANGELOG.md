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

## #19 Me screen with sign up, sign in and sign out

Shipped:

- The Me page (`(dock)/me/page.tsx`), a client component on `me.get`. Guest: `Guest` heading, `AccountForms`, then the summary and ledger, so a guest sees what they would keep. Signed in: `PlayerHeader`, `View profile` (to `/u/<username>`) and `Sign out`, then the summary and ledger.
- `components/stat-row.tsx`: `StatRow({ label, stats })` and `MAX_FREEZES`, moved out of `today-status.tsx`. A stat without a `value` is a skeleton. Items are `flex-1 basis-0`, so three or four share the width. `TodayStatus` and `TodayStatusSkeleton` keep their signatures.
- `components/player-summary.tsx`: `PlayerHeader({ name, username, isBot?, rankBadge })`, `PlayerSummary({ summary })` (stats, activity graph, badges, season awards) and `PlayerSummarySkeleton`. `Summary` is a `Pick` of `profile.byUsername` that `me.get` also satisfies. No hooks and no `"use client"`, so #20's server page can render it.
- `components/points-ledger.tsx`: `PointsLedger({ ledger })`, titled `Recent points`.
- `components/account-forms.tsx`: `AccountForms`, sign up and sign in in one component, switched by a text button under the form.
- Removed `@tanstack/react-form` from `apps/web` (kept in #15 for this issue): two small forms need no form library.

Decisions:

- Badges: all four show, in spec order, in a 2-column grid, each with how to earn it. Icons: First Token `Coins`, On Fire `Flame`, Perfect Week `CalendarCheck`, Hallucination Hunter `ScanEye`. Earned gets a `bg-brand/15 text-brand` tile. Unearned gets a muted tile and name plus the words `Not yet`, so the state is not colour only. #20 shows the same list.
- Stats: `points` (`Coins`), `day streak` (`Flame`), `longest` (`Medal`), `freezes` (`Snowflake`, `n/2`). Season awards read `Season n · da goat`, newest first, with an empty line when there are none. `SeasonAward.award` is a `string` column, so the label lookup asserts it is a rank badge.
- Ledger reasons: `round` → `Correct answer`, `perfect` → `Perfect day`, `streak` → `Streak bonus`, `seed` → `Starting points`, anything else as is. Dates are `en-GB`, `day: "numeric", month: "short"`, in `Asia/Kolkata`, because the game day is IST. Rows are keyed `reason:ref`, which is unique per player.
- Forms are a plain `<form>` read with `FormData`. Shape rules are native validation (`required`, `minLength`, `maxLength`, `pattern="[a-zA-Z0-9_.]+"`, `type="email"`), matching Better-Auth's username rules (3 to 30, `[a-zA-Z0-9_.]`) and password minimum (8). Server errors map by `error.code`: `USERNAME_IS_ALREADY_TAKEN` and the three username shape codes under Username, `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` and `INVALID_EMAIL` under Email, the password length codes under Password, `INVALID_EMAIL_OR_PASSWORD` as `Wrong email or password.`, anything else as `Could not sign up. Try again.` / `Could not sign in. Try again.`. A rejected promise (network) shows `Could not reach the server. Check your connection and try again.`
- An existing email on sign-up returns 422 `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` (checked). `USER_ALREADY_EXISTS` was not seen, so it is not mapped.
- Pending: the form's `<fieldset>` is disabled and the submit button shows a `Spinner`. On success nothing else runs: `signUp`/`signIn` reset the queries (#14), `me.get` refetches, and the page re-renders signed in without a reload. The reset shows the skeleton briefly; accepted.
- Sign out is a `ghost` button with a `Spinner` while pending and a `Could not sign out.` toast on error.
- Verified with `playwright-cli` (Helium) against `next dev` (`ALLOW_TEST_CLOCK=true`) at 393x851. The Today status row is still 82px after the `StatRow` move. A guest who answered one round correctly saw 10 points, First Token earned, and `Correct answer · 14 Oct · +10`, equal to `me.get`. Sign-up with username `priya.ships` showed the taken message under Username with `aria-invalid` on that input only. Sign-up with `priya.ships@bots.invalid` showed the email message. An aborted sign-up showed the network line and re-enabled the form. With sign-up held 2s the fieldset was disabled with a spinner. A fresh guest signed up and the page switched to the signed-in view with a `window` marker intact (no reload). `psql` then found no user and no attempts left for either anonymous id, and the new account had the guest's attempt. Sign out: guest view with 0 points, anonymous users went from 16 to 17, no reload. As that guest, 2 correct answers on 15 Oct (`x-test-now`), then sign in with a wrong password (`Wrong email or password.`), then the right one: points went from 10 to 30 and the ledger gained both 15 Oct entries, no reload. Screenshots: sign-up form, field error, pending, sign-in error, signed in top and scrolled to the ledger.

Deviations:

- Screenshots are dark only, not the issue's light and dark, because the app is dark only by product owner decision (#1).

## #18 Board screen

Shipped:

- The Board page (`(dock)/board/page.tsx`), a client component on `board.season`: header `Season n` with `{time} left · Top 10 keep their badge when the season ends`, the ranked list, and a pinned slot.
- `components/player-tags.tsx`: `RANK_LABEL` (`goat` → `da goat`, `10x` → `10x dev`), `RankBadge({ badge })` (renders nothing for `null`) and `BotTag`. #19 and #20 use them for the profile header and season awards.
- `components/board-list.tsx`: `BoardRow({ row, isMe })`, `BoardList({ rows, myRank })`, `BoardListSkeleton`.
- A `brand` variant on `Badge` (`packages/ui`), `bg-brand/15 text-brand`, documented in DESIGN.md. `cn` is not tailwind-merge, so a `className="bg-brand/15"` on the default variant would ship beside `bg-primary`.
- A placeholder `app/u/[username]/page.tsx`. `typedRoutes` rejects a `Link` to `/u/${username}` until the route exists. #20 replaces it.

Decisions:

- Time left is `endsAt - serverTime`, so the test clock and a wrong device clock both work. Format: two units at most, floored (`4d 21h`, `5h 12m`, `12m`, `under a minute`). It does not tick: minute precision on a screen that refetches on focus is enough.
- `da goat` uses the `brand` badge, `10x dev` uses `secondary`, so nine brand chips do not flood the board. `bot` is `outline`.
- The pinned slot is `sticky` at `bottom-[calc(5rem+env(safe-area-inset-bottom))]`, the last child of `<main>`, ringed on `bg-popover` because it floats. While scrolling it sits 12px above the dock. At the end of the scroll it rests in place, so the dock layout's padding contract holds and the last row is never covered.
- The pinned slot always shows the caller's row when they rank, even when that row is also visible in the list. The list row is also highlighted (`bg-brand/5`, `aria-current="true"`).
- Anonymous: `Claim your account to get ranked.` with a `Sign up` button to `/me`. Signed in with no points this season: `No points this season yet. Play today’s rounds to get on the board.` with `Play` to `/`.
- The whole row is the link (no row actions), with an inset focus ring. A row whose `username` is `null` (only possible for an account made outside our form) renders unlinked, without the `@` line.
- Link-styled buttons are `<Link className={buttonVariants(…)}>`, not `<Button render={<Link />}>`. The render form logs a Base UI error unless `nativeButton={false}` is set, and with it the `<a>` gets `role="button"`, so screen readers announce a link as a button. Found in #20, applied to every link button in #18 to #20. DESIGN.md's Button paragraph now says so.
- Verified with `playwright-cli` (Helium) against `next dev` (`ALLOW_TEST_CLOCK=true`) at 393x851, after `pnpm db:seed:players`. Anonymous: 22 rows (20 bots and 2 earlier test accounts), every bot tagged `bot`, `da goat` only on rank 1, `10x dev` on ranks 2 to 10 only, the claim prompt pinned with its link to `/me`, `4d 21h left` at 21:25Z on 13 Oct (season ends 18:30Z on 18 Oct). Signed up in-page and answered 5 rounds (2/5): pinned row and highlighted list row both `22 · Board Tester · 25`, equal to `board.season.me`. With a 500-point `seed` entry added by `psql`, the same user was rank 1 `da goat` at 525 in both places, and Priya Raman dropped to `10x dev`. A fresh sign-up with no answers showed the no-points line. Scrolled to the end, the last row ended 21px above the pinned slot, and the slot 28px above the dock. With `rows: []` the empty state showed above the pinned slot. With the query held 4s, the skeleton list was 505px tall and the loaded list's first 8 rows 503px plus its 2px border. A forced 500 showed `Could not load the board.` after React Query's retries. Clicking Priya Raman's row went to `/u/priya.ships`. Screenshots: anonymous top and end, ranked outside the top 10, da goat, signed in with no points, empty, loading, error.

Deviations:

- Screenshots are dark only, not the issue's light and dark, because the app is dark only by product owner decision (#1).

## #17 Today: round card, reveal and done state

Shipped:

- `RoundCard({ round, total, onAnswered, onNext })` (`components/round-card.tsx`): theme, `Round n/5`, three full-width statement buttons. It owns the `game.answer` mutation. On success it calls `onAnswered`, writes the `result` into the `game.today` cache with `setQueryData`, then invalidates `game.today`, so the graph and streak update in the background and, after round 5, `done` arrives.
- `DayDone({ done, total, receivedAt, onNewDay })` (`components/day-done.tsx`): score `x/5`, non-zero point reasons (`Correct rounds`, `Perfect day`, `Streak bonus`) and their sum as `Points earned`, and `Next set in HH:MM:SS`.
- `RouterOutputs` (`utils/trpc.ts`): `inferRouterOutputs<AppRouter>`, for typing query data in components (`RouterOutputs["game"]["today"]`). #18 to #20 can use it.
- The `.glitch` class in `apps/web/src/index.css`: put it on an element with `data-text` equal to its text.
- The Today page shows the round in `revealedId` if it has a result, else the first unanswered round, else `DayDone`. `revealedId` is set on answer and cleared by Next, so Next and a reload both land on the first unanswered round.

Decisions:

- The reveal is read from `round.result` only, as #11 requires. The pick is marked `Your pick` with a green tick or a red cross. The fake gets a red border and tint, the `Hallucination` tag, a strikethrough and its correction below. Truths get `Source`, opening in a new tab with `rel="noopener noreferrer"`. The status line reads `Caught it · +10 points` (points in `text-brand`) or `Missed it · 0 points`, in a `role="status"` region that exists before the answer, so the result is announced.
- Glitch: 600ms, `steps(1, end)` so it looks like broken frames rather than a slide. The text jitters (translate, skew, opacity) while `::before` (destructive) and `::after` (brand) copies, drawn from `content: attr(data-text) / ""` so screen readers skip them, flash out of register. Transform and opacity only. It plays once because the reveal element mounts once, and a reload never shows a revealed round. `prefers-reduced-motion: reduce` turns off all three animations.
- Pending: every statement button is disabled, the tapped one gets `aria-busy` and a `Spinner` in place of its letter, the other two drop to 50% opacity. On failure the buttons come back with `Could not save your answer. Tap a statement to try again.` (`role="alert"`). Any statement may be tapped on retry: if the first request did land, the server returns the original pick.
- Next is the `Button` at `lg`, full width, `autoFocus`ed, because the tapped button is replaced by the reveal and focus would otherwise drop to `<body>`. Its label stays `Next` on round 5 too, as the spec words it.
- Countdown: `deadline = dataUpdatedAt + (nextDayStart - serverTime)`, ticking every second off `Date.now()`. Only device elapsed time is used, so a wrong device clock does not move it, and the test clock works. At zero it calls `today.refetch()` once. If the server still says it is the same day, the new `serverTime` gives a new deadline and the timer restarts.
- If Next on round 5 is pressed before the background refetch has brought `done`, the slot is empty until it lands. Not seen in testing: the refetch starts as the reveal appears.
- An answer sent from a stale day (the tab sat across midnight on an unanswered round) gets `BAD_REQUEST` and shows the same retry line, which keeps failing until the page refetches (on focus or reload). Not handled: it needs a tab left open across midnight mid-round.
- Verified with `playwright-cli` (Helium) against `next dev` (`ALLOW_TEST_CLOCK=true`) at 393x851, as a fresh anonymous user. With `game.answer` held 3s then failed with a 500: the tapped button was disabled with `aria-busy="true"` and the others at opacity 0.5, then the error line showed and all three were enabled again. A real answer showed the reveal with focus on Next, two source links with `noopener noreferrer`, and `Caught it · +10 points`. The mid-glitch shot is all animations paused at 90ms. Next went to round 2/5. After answering round 2 (reveal on screen, Next not pressed), a reload landed on round 3/5. Rounds 3 to 5 ended in `2/5`, `+20`, `+5` streak, `+25`, and `Next set in 21:23:57`, matching 18:30Z. With `x-test-now` at `2026-10-14T23:59:55+05:30` the countdown showed `00:00:05`. With the header switched to the next day, the page showed `Round 1/5` of the new day 5.3s later. With reduced motion emulated, `.glitch` had 0 running animations. Screenshots: round, pending, error, reveal mid-glitch and settled, done.

Deviations:

- Screenshots are dark only, not the issue's light and dark, because the app is dark only by product owner decision (#1).

## #16 Today: status header and activity graph

Shipped:

- `ActivityGraph({ graph: GraphCell[] })` and `ActivityGraphSkeleton` (`components/activity-graph.tsx`). It takes only the graph, so #19 (`me.get.graph`) and #20 (`profile.byUsername.graph`) pass theirs straight in. `GraphCell` is imported as a type from `@kenpathlabs/api/game/history`.
- `TodayStatus({ streak, freezes, season })` and `TodayStatusSkeleton` (`components/today-status.tsx`): one bordered row of three stats in a `<dl>`.
- The Today page (`(dock)/page.tsx`) is a client component on `game.today`: skeleton while pending (faded in after 500ms), the inline error block `Could not load today.` on error (the query cache already toasts with a retry), and on success the status row, then the graph, then a commented slot where #17's round card or done state goes. It has a visually hidden `<h1>Today</h1>`, since the dock already names the screen.

Decisions:

- Graph layout: `grid-flow-col grid-rows-7 grid-cols-20`, so each column is a week, Monday on top (the first cell is always a Monday), and the height is always 7 rows whatever the cell count (134 to 140). The last column is partial, no filler cells. `gap-[3px]` is the one arbitrary value: 2px blurs 15px cells together, 4px wastes width.
- Shades: `correct` 0 is `bg-muted`, 1 to 5 are `bg-brand/20`, `/40`, `/60`, `/80`, `bg-brand`. A frozen day is `bg-frozen`. The last cell (always today) has a 1px foreground outline. Cells and legend swatches are `rounded-xs` (2px): `rounded-sm` is 6px, which turned 15px cells into circles, and DESIGN keeps circles for controls.
- Each cell has one label used as both `title` and `sr-only` text: `Mon 12 Oct: 3 of 5 correct`, `Tue 13 Oct: frozen`, `Today, ` on the last cell. Dates are `toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })` on `${day}T00:00:00Z`, so the device's zone cannot shift the day. en-GB abbreviates September as `Sept`.
- The data cannot tell a missed day from a played 0/5 day (both `correct: 0`), so both say `0 of 5 correct` and share the 0 shade. The visible summary, `Played n of the last N days · f frozen`, counts "played" as `correct > 0`.
- The legend (`Less`, six swatches, `More`, then `Frozen`) is `aria-hidden`: with only the swatches hidden it read as "LessMore", and every cell already names its own state.
- The freeze cap `2` is a literal (`MAX_FREEZES` in `today-status.tsx`). The api's constant is not exported, and the cap is a product rule.
- The skeleton keeps icons, labels, the graph heading and the legend, and swaps only the values (`Skeleton h-7 w-8`), the cells (140 muted, one `animate-pulse` on the `<ol>`) and the summary line, so nothing moves when data lands.
- The verification history is a one-off `psql` insert, not a committed script. Run with `-v uid=<user id>` (take the id from an in-page `fetch('/api/auth/get-session')`): 60 past days, `g % 6` correct per day, days 46, 37, 36, 20, 19, 18 and 9 missed, which gives every shade, frozen cells and a reset.

  ```sql
  INSERT INTO "Attempt" (id, "userId", day, "roundId", "statementId", correct)
  SELECT gen_random_uuid()::text, :'uid',
         to_char((now() AT TIME ZONE 'Asia/Kolkata')::date - g, 'YYYY-MM-DD'),
         r.id, s.id, (r.position % 5) < (g % 6)
  FROM generate_series(1, 60) g
  CROSS JOIN LATERAL (SELECT id, position FROM "Round" ORDER BY position LIMIT 5) r
  CROSS JOIN LATERAL (SELECT id FROM "Statement" WHERE "roundId" = r.id ORDER BY id LIMIT 1) s
  WHERE g NOT IN (46, 37, 36, 20, 19, 18, 9);
  ```

- Verified with `playwright-cli` (Helium) against `next dev` at 393x851. With the seeded user, the header showed 16 / `1/2` / 1, equal to an in-page `fetch` of `game.today`. The grid had 136 cells, equal to `graph.length`, 6 `bg-frozen` cells equal to the `frozen: true` count, exactly one outlined cell (the last), cells 15.2px wide. The accessibility tree listed every cell label from `Mon 1 Jun` to `Today, Wed 14 Oct` and the summary `Played 45 of the last 136 days · 6 frozen`, and the region resolves to the name "Last 20 weeks". With `game.today` held back 4s, the skeleton's graph `<ol>` was 124.42px tall, the same as loaded, and the status row (82px) and graph section (208.42px) matched too. A forced 500 showed the error block. On a phone-width screen the existing query-error toast covers the dock; left for the UI polish issues.

Deviations:

- Screenshots are dark only, not the issue's light and dark, because the app is dark only by product owner decision (#1).

## #15 App shell: dock, layout, accent

Shipped:

- `app/(dock)/layout.tsx`: every screen except `/u/[username]` (#20, under `app/u/`, no dock) renders in a centred `max-w-120` (480px) `<main>` with `gap-5 px-4 pt-6`, plus the dock. Its bottom padding, `pb-[calc(6rem+env(safe-area-inset-bottom))]`, is the contract: a screen adds no bottom padding of its own and its last line still clears the dock.
- `components/dock.tsx`: a fixed pill nav (Today `/`, Board `/board`, Me `/me`) with a gradient scrim behind it. The active link carries `aria-current="page"` and is styled from that attribute.
- `(dock)/page.tsx`, `(dock)/board/page.tsx`, `(dock)/me/page.tsx` are placeholders (title plus one line) for #16 to #19.
- Tokens `brand` and `frozen` in `packages/ui/src/styles/globals.css` (`:root`, `.dark` and `@theme inline`), so `bg-brand/15`, `text-brand`, `bg-frozen` work. Documented in `DESIGN.md`, which also gained a "Dock frame" paragraph.
- The root layout exports `viewport` (`viewportFit: "cover"`, so `env(safe-area-inset-*)` is not 0, plus `colorScheme: "dark"` and `themeColor: "#121212"`) and the title "Hallucinated".
- Deleted: `/login`, `header.tsx`, `user-menu.tsx`, `sign-in-form.tsx`, `sign-up-form.tsx`, and the Geist fonts (never read: `font-sans` is the system stack).

Decisions:

- The accent is called `brand`, because `accent` is already shadcn's hover tint and the `packages/ui` primitives use it.
- `brand` is violet (Tailwind violet-600 light, violet-400 dark), clear of the hues that already mean something (`success` green, `destructive` red, the blue `chart-*` ramp). Violet-400 on `#121212` is readable as text (about 6.8:1, computed, not measured with a tool). `frozen` is sky (sky-500 / sky-400), about 60° from violet, so a frozen cell does not read as a graph shade. It lands here so the palette changes once; #16 is its first user. No `brand-foreground` yet, since nothing puts text on a solid brand fill.
- The document scrolls, not an inner `<main>` (DESIGN's single scroller belongs to its sidebar frame). On a phone that lets the browser bar collapse and keeps native scroll restoration.
- `px-4`, not DESIGN's `p-6`, so #16's 20-column graph gets about 15px cells at 393px.
- The template sign-in and sign-up forms went with `/login`, their only user. #19 writes new forms against `signUp` / `signIn` in `lib/auth-client.ts`. `@tanstack/react-form` stays in `package.json` for it.
- Every dock item has an icon and a label (`CalendarCheck`, `Trophy`, `CircleUser`), 48px tall. Active match is exact `pathname`, since there are no nested dock routes.
- Verified with `playwright-cli` (Helium) against `next dev` at 393x851 and 1280x800: on `/`, `/board` and `/me` exactly one link has `aria-current="page"` and it is the right one. Dock clicks navigate without a reload (a `window` marker survived). `/login` returns 404. With 2000px of content injected and the page scrolled to the bottom, the last line ends 28px above the dock at 393x851. Safe-area insets are not verifiable in desktop Chromium (`env()` is 0); #21's phone pass covers them. In dev, the Next.js and TanStack devtools buttons sit beside the dock; they do not ship.

Deviations:

- Screenshots are dark only, not the issue's light and dark, because the app is dark only by product owner decision (#1), re-confirmed for this issue. The light token values are defined anyway so every token pair stays complete.

## #14 Client data layer

Shipped:

- `authClient` (`apps/web/src/lib/auth-client.ts`) with the `anonymousClient` and `usernameClient` plugins.
- `signUp({ name, username, email, password })`, `signIn({ email, password })` and `signOut()` in the same file. Each returns Better-Auth's `{ data, error }` and resets all queries on success. Reset, not invalidate: invalidate keeps the previous account's data (the ledger) on screen until the refetch lands, and for good if it fails. `signOut` starts a new anonymous session before resetting, so refetches never see `UNAUTHORIZED`. If that anonymous sign-in fails, it reloads the page, which lands in the `AnonymousSession` gate and its retry. A network failure rejects (Better-Auth's client does not set better-fetch's `catchAllError`), so the forms must catch.
- `ensureAnonymousSession()`, which resolves `true` or `false` and runs one shared sign-in at a time.
- `AnonymousSession` gate (`components/anonymous-session.tsx`), mounted inside `Providers`. The root layout is now async: it reads the session with `readSession` and passes `hasSession` down. With a session, children render at once. Without one, it shows `Loader`, signs in anonymously, then renders children, so nothing under it ever queries without a session.
- `readSession(headers)` (`apps/web/src/server/services.ts`): the only way server code reads the session (layout and tRPC context). It never extends the session, see below.
- The tRPC client and React Query provider were already in place from the template (`utils/trpc.ts`, `providers.tsx`).

Decisions:

- The session check runs on the server instead of through `authClient.useSession()`. Gating on `useSession` would put a `/get-session` round trip in front of every game query on every load.
- The sign-in promise is shared at module level, because React dev runs effects twice and two calls with no cookie create two anonymous users.
- On failure (error response or network error) the gate keeps the loader and shows a toast that stays up until its retry button is used. With the default toast duration, the retry button disappeared and left the visitor stuck. Retry reloads the page instead of signing in again: a response that fails after its `Set-Cookie` arrived leaves a valid anonymous session, and Better-Auth rejects an anonymous sign-in from an anonymous session, so a second sign-in would fail forever. After a reload the layout sees the cookie, or the gate signs in from scratch.
- The template `sign-in-form`, `sign-up-form` and `user-menu` stay until #15 and #19.
- Two fresh tabs signing in anonymously at the same moment each create a user, and the later cookie wins, orphaning anything the first tab played. Accepted: it needs two tabs opened together on a first visit, and fixing it needs cross-tab coordination.
- **The session cookie is extended from the browser only.** Better-Auth 1.7.3 (`api/routes/session.mjs`) extends a session once a day on read and sets the new cookie on that read's response. A server-side `auth.api.getSession` call discards that response, and then the client's `/get-session` finds a fresh session and sets nothing. Checked in the browser: with the DB session backdated 2 days, a reload moved `expiresAt` 7 days ahead and no response carried `Set-Cookie`. So the cookie died 7 days after sign-in even for a daily player, orphaning anonymous progress (the tRPC context had this before #14). Fix: `readSession` passes `query: { disableRefresh: true }`, and `AnonymousSession` calls `authClient.getSession()` once per load when `hasSession`, without blocking render. Re-checked with both the DB session and the cookie backdated to expire in 5 days: after a reload both expire 7 days from now. #15 can drop `useSession` freely, as long as `AnonymousSession` stays mounted.
- Verified with `playwright-cli` (Helium) against `next dev`, StrictMode on by default. First visit with no cookie: one `POST /sign-in/anonymous`, the anonymous `user` count went up by exactly 1, and the app rendered. Reload: no sign-in request, count unchanged. In-page `fetch('/api/trpc/game.today')` returned 200 with 5 rounds. Sign-in forced to 503, and separately aborted as a network failure: the loader stayed with the toast, and after the route was lifted, retry created one user and rendered the app (checked before retry became a reload, not re-checked since). `signUp`, `signIn` and `signOut` have no UI yet and are not exercised. They are type-checked only.

## #13 Me and public profile queries

Shipped (`packages/api/src/routers/player.ts`):

- `me.get` (query, any session including anonymous): `{ name, username, points, currentStreak, longestStreak, freezes, graph, badges, rankBadge, seasonAwards, isAnonymous, ledger }`. `points` is the all-time sum. `rankBadge` is the live `"goat" | "10x" | null` for the current season. `seasonAwards` is `[{ seasonNumber, award }]`, newest first. `ledger` is the newest 50 entries, `[{ amount, reason, ref, createdAt }]` with ISO `createdAt`. `username` is `null` for anonymous users.
- `profile.byUsername` (public query) `{ username }`: the same fields without `isAnonymous` and `ledger`, plus `isBot`. `NOT_FOUND` for an unknown username or an anonymous user.

Decisions:

- Both run `finalizeEndedSeasons` first, so a just-ended season's award shows up.
- The ledger is capped at 50 with no pagination. A full day writes at most 7 entries, so 50 is about a week. Ties on `createdAt` order by `id` desc.
- `rankBadge` comes from the full season standings, so it always matches the board, at the cost of one aggregate per read.
- Lookup lowercases the input, because the username plugin stores `username` lowercased (`/u/Priya.Ships` resolves). Responses carry the lowercased `username`, not `displayUsername`. Anonymous users never have a profile. Better-Auth 1.7.3 lets an anonymous session set a username through `/update-user`, so the lookup also selects `isAnonymous` and returns `NOT_FOUND` for it. `me.get` returns such a username as is.
- "Seeded bot" correctness is checked through `profile.byUsername` only, because bots cannot sign in.
- Verified manually with `curl` and `psql` against `next dev`. An anonymous session answered 5 rounds on 2026-10-12 and 5 on 2026-10-13 with `x-test-now`, then signed up. `me.get` showed streak 2/2, `first-token`, two graph days (2 and 4 correct), 75 points equal to the `psql` sum and the ledger newest first. `profile.byUsername` with the username uppercased returned the same fields. `board.season` gave that user a `me` row with `isAnonymous: false`. `priya.ships` showed 420 points, no streaks or badges, `rankBadge: "goat"`, `isBot: true` and no `ledger`. With `x-test-now` in season 2 it showed `seasonAwards: [{ seasonNumber: 1, award: "goat" }]`. An unknown username returned 404 `NOT_FOUND`. `me.get` with no session returned 401.

## #12 Season finalization and board query

Shipped:

- `packages/api/src/seasons.ts`. `seasonStandings(db, n)` sums each player's `PointEntry` rows inside `seasonWindow(n)` (`reachedAt` is the latest entry) and returns `rankSeason` output with `name`, `username` and `isBot` added. `finalizeEndedSeasons(db, now)` writes a `Season` row and the top 10 as `SeasonAward` for every season that ended at least a minute ago and has no row yet. It lives beside `game/`, not in it, because it reads the DB.
- `board.season` (public query): `{ season, endsAt, serverTime, rows, me, isAnonymous }` with ISO strings. `rows` is the top 50, each `{ rank, name, username, isBot, points, badge }`, `badge` being `"goat" | "10x" | null`. `me` is the caller's row wherever they rank, or `null`.

Decisions:

- One transaction per ended season, oldest first. The `Season` insert uses `createMany` with `skipDuplicates` (`ON CONFLICT DO NOTHING`), not a caught unique error, because an error aborts a Postgres transaction. A concurrent request inserting the same number waits for the first, then writes nothing and skips the awards. A season with no ranked players gets its row and no awards.
- Finalization waits one minute past the season end. Answers are stamped with the request time, so an answer stamped just before the end can still be in its transaction when the next season starts, and awards written then would miss its points. A minute is far past Prisma's 5s interactive-transaction timeout. Awards therefore appear a minute into the new season. Verified with `x-test-now`: season 3 was not finalized at 18:30:30Z or 18:30:59Z on 2026-11-01, and was at 18:31:01Z.
- `board.season` is public. With no session or an anonymous one, `isAnonymous` is `true` and `me` is `null`. A signed-in user with no points this season also gets `me: null`, told apart by `isAnonymous: false`.
- No user ids in the response. `rank` is unique, so it is the row key.
- `serverTime` is returned like `today.done.serverTime`, so the countdown to `endsAt` works under the test clock.
- Finalizing under `x-test-now` is permanent: a request faked into season 2 finalizes season 1 for real. Reset a local DB with `TRUNCATE "SeasonAward", "Season"`.
- Verified manually with `curl` and `psql` against `next dev`. With no session and with an anonymous one: 20 bots plus one real user, anonymous users holding points left out, `me: null`. Five parallel requests with `x-test-now` in season 2 wrote one `Season` row and 10 awards (rank 1 `goat`, 2 to 10 `10x`), with no errors. Five more changed nothing. A signed-in user's `me` row is checked in #13.

## #11 Today query and answer mutation

Shipped:

- `Context.now` (`packages/api/src/context.ts`). Procedures read time only from it. `apps/web/src/server/context.ts` sets it from the `x-test-now` header (any `Date`-parsable string, e.g. `2026-10-15T09:00:00+05:30`) when `ALLOW_TEST_CLOCK=true` and the build is not production, otherwise `new Date()`. `ALLOW_TEST_CLOCK` is in `apps/web/.env.schema`, default `false`. Playwright sets it in the web server's env.
- `game.today` (query, any session including anonymous): `{ day, season, streak, freezes, graph, rounds, done }`. Each round is `{ id, number, theme, statements: [{ id, label, text }], result }`. `result` is `null` until answered. Once answered it is `{ pickedId, correct, fakeId, correction, sources: [{ statementId, url }], points }`. `done` is `null` until all 5 are answered, then `{ correct, points: { round, perfect, streak }, nextDayStart, serverTime }` with ISO strings.
- `game.answer` (mutation) `{ roundId, statementId }` returns the same `result` object as `today`.

Decisions:

- Unanswered rounds never carry `isFake`, `correction` or `sourceUrl`. The reveal lives only in `result`, so the UI reads it from there and not per statement.
- `answer` returns only the round's `result`. After the 5th answer the UI refetches `today` for `done`.
- `statementOrder` gets statements sorted by `id`, because its output depends on input order and the DB has no statement position. Changing that sort reshuffles every round.
- `answer` locks the user row (`SELECT ... FOR UPDATE`) inside its transaction, so two concurrent answers to different rounds cannot both miss the 5th answer and skip the day bonuses.
- Round, perfect and streak entries use `createMany` with `skipDuplicates` (`ON CONFLICT DO NOTHING`), and bonuses are only computed when the attempt insert actually wrote a row.
- A round's `points` is 10 when correct, otherwise 0, derived from the attempt. `done.points` sums the ledger: `round` entries with ref `"<day>:"…` and `perfect`/`streak` entries with ref `"<day>"`.
- An unknown round, a round not scheduled today, and a statement from another round all return the same `BAD_REQUEST`.
- Both procedures use `protectedProcedure`. Without a session they return `UNAUTHORIZED`. The client signs in anonymously first (#14).
- `answer` sets `createdAt` to `ctx.now` on the attempt and its point entries, instead of the DB clock, so under the test clock points land in the faked season (needed for the board E2E in #25). Added after #14. Checked: answers with `x-test-now` on 2026-10-19 put the player on the season 2 board and not on season 1.
- Verified manually with `curl` against `next dev` and `psql`, as anonymous users. 5/5 wrote 5 `round` entries, `perfect` 20 and `streak` 5. 4/5 wrote 4 `round` entries and `streak` 5, no `perfect`. Answering again with the same or a different statement returned the original result and wrote no rows. `x-test-now` the next day gave `streak` 10. The header was ignored with the flag off. The production-build gate (`process.env.NODE_ENV` inlined by Next) is not verified with a build.

## #10 Merge anonymous progress on sign-up and sign-in

Shipped: `mergeAnonymousProgress(db, fromUserId, toUserId)` in `packages/auth/src/merge.ts`, wired as `anonymous({ onLinkAccount })` in `createAuth`. Every day the anonymous user played that the target account has not played moves across: its attempts, its `round` entries (`ref` starting `"<day>:"`) and its `perfect` and `streak` entries (`ref` equal to `"<day>"`). Everything else goes with the anonymous user when Better-Auth deletes it (cascade).

Decisions:

- Better-Auth 1.7.3 runs `onLinkAccount` from an after-hook on paths starting `/sign-in`, `/sign-up` or `/callback`, only when the response sets a new session and the request carried an anonymous one. For us that is `/sign-up/email`, `/sign-in/email` and `/sign-in/username`. It deletes the anonymous user only after the callback returns, so a failed merge keeps the anonymous user and loses nothing. Whether the new session cookie still reaches the client in that case is not verified.
- Sign-up uses the same path as sign-in: a new account has no attempts, so every day moves.
- One interactive transaction. No unique conflict is possible on a moved day, because the target has no attempts that day and point entries only come from attempts. Anonymous users never get `seed` entries.
- The merge transaction first takes `SELECT ... FOR UPDATE` on the target `user` row, the same lock `game.answer` takes. Without it, an answer on another device could finish a day mid-merge (the target had 1 round, the anonymous user 4 others), and neither side would see 5 attempts, so the perfect and streak entries were never written. Sign-up still completes (118 ms against `next dev`), so the new user row is committed before `onLinkAccount` runs.
- Starting a new anonymous session after sign-out is client behaviour, left to the UI issues.
- Verified manually (no answer procedure or Playwright yet): `curl` against `/api/auth` plus `psql` inserts. Sign-up after playing today moved all attempts and entries. Sign-in with the anonymous user having played today and yesterday, for an account that had played today, moved only yesterday's attempts and `round`, `perfect` and `streak` entries. In both cases no rows referenced the anonymous id afterwards. Automated coverage lands with the Playwright suite.

## #9 Seed 20 bot players

Shipped: `pnpm db:seed:players` (`packages/db/src/seed-players.ts`) creates 20 bot users and one `seed` point entry each for the current season. Bot ids are `bot-<username>`, emails `<username>@bots.invalid`, `isBot = true`, `displayUsername` equals `username`, and there is no `account` row, so no login path exists. The entry has `reason: "seed"`, `ref` set to the season number and `createdAt` now, so it falls inside the season window.

Decisions:

- Both inserts are `createMany` with `skipDuplicates` (`ON CONFLICT DO NOTHING`) in one batch transaction. A re-run in the same season writes nothing. In a new season the bots already exist, and only the new season's entries are written.
- **Bots only score in seasons where the script was run.** Run it once per season (no cron exists).
- Amounts are a fixed list from 420 (rank 1) down to 15 (rank 20), totalling 3505. Rank 10 is 170: a perfect player (75, 80, 85, 90, 95 per day) passes it on day 3, and a 4/5 player (about 45 to 65 per day) on day 4.
- If a real user already holds a bot's username or email, that bot is skipped, and its point entry fails on the FK, which rolls back the batch. This is left as a loud failure.

Deviations: `packages/db` imports `seasonNumber` from `packages/api/src/game/clock.ts` by relative path. `@kenpathlabs/api` depends on `@kenpathlabs/db`, so a package dependency the other way would be a workspace cycle. `clock.ts` has no imports, so the relative path pulls in nothing else.

## #8 Content: rounds for days 8 to 14

Shipped: `content/rounds.json` holds 70 rounds (days 1 to 14). Positions 36 to 70 are new, one theme per round, no theme or fact repeated from days 1 to 7. `pnpm db:seed` seeds 70 rounds and 210 statements. Days 15 onward append after position 70.

Decisions:

- Fakes vary the changed detail: company or lab (13), number (12), winner or result (4: GAIA scores, GraphCast vs HRES, Chatbot Arena anonymity, speculative decoding outputs), a product or model that does not exist (3: Alexa Pro, Claude Haiku 4, Llama 4 Titan), person (1) and name or acronym (2).
- Claims a vendor makes about itself are attributed in the text ("Google said", "Google says", "OpenAI reported") where others dispute them: Gemini Ultra's 90.0% MMLU is a CoT@32 score, and the GPT-4 bar exam percentile has been questioned.
- Wording is pinned so it stays true: "original AlphaCode" (AlphaCode 2 did reach the top 5%), "Anthropic's first Responsible Scaling Policy" (later versions dropped ASLs as the structure), "LAION-5B was released with" (Re-LAION-5B is smaller), "Qwen3 launched with", "Mojo ... created by Modular" (Qualcomm acquired Modular), "previously called the AI Safety Institute" (it began as the Frontier AI Taskforce, so "first called" was wrong), "In Chatbot Arena's battle mode" (other modes show model names).
- Dropped as a fake because the origin is disputed: "speculative decoding was introduced by Google" (Peking University and MSRA claim the name first). The fake now changes the result instead.
- Sources moved where the original URL stopped supporting the claim: Imagen cites `imagen.research.google` (`deepmind.google/models/imagen` now redirects to the Gemini image page), Mojo cites `mojolang.org/docs/faq` (`modular.com/mojo` redirects to a page that does not name Modular), PaLM cites the Google Research blog (the arXiv abstract does not name Google), DSPy cites `nlp.stanford.edu`.
- Each truth and each fake's correction was checked by opening its source and quoting the supporting sentence. openai.com, ai.meta.com, microsoft.com/research and physicalintelligence.company block scripts, so those were checked through Web Archive copies. Their links are kept because they load in a browser.

## #7 Content: rounds for days 1 to 7

Shipped: `content/rounds.json` holds 35 rounds (days 1 to 7, positions 1 to 35), one theme per round, no theme repeated. `pnpm db:seed` seeds 35 rounds and 105 statements. #8 (days 8 to 14) appends after position 35.

Decisions:

- Kept the 5 sample rounds from #6 as day 1. Replaced their Wikipedia sources with vendor, repo or paper links, and reworded the PyTorch truth to "Facebook AI Research, now part of Meta", because the paper predates the Meta name.
- "No dates shown to players" is read as: no years or dates in statement text. Facts that only hold for one year (which IMO, which ARC Prize rules) were swapped for facts that need no year.
- Fakes vary the changed detail: company, lab or HQ (13), number (13), winner or result (3), a model that does not exist (2: GPT-4o nano, o2), and license, architecture or acronym (4).
- Where the abstract page does not name the affiliation the truth claims, `sourceUrl` points at the arXiv PDF (`/pdf/`), whose first page does.
- `reasoning-models-r1-zero` cites `arxiv.org/abs/2501.12948v1`, because v2 of the abstract no longer mentions R1-Zero.
- A few truths are pinned to a model version so they stay true: "original Whisper", "the largest Llama 3.1 model", "a preview of OpenAI's o3", "Operator was powered by".
- Each truth and fake correction was checked by opening its source and quoting the supporting sentence. openai.com, awards.acm.org and ir.kuaishou.com return 403 to scripts, so those were checked through Web Archive copies or the vendor's other pages (system card, GitHub repo). Their links are kept because they load in a browser.

## #6 Round content format and the db:seed validator

Shipped:

- `content/rounds.json`: an ordered array of `{ id, theme, statements: [{ id, text, isFake, correction?, sourceUrl? }] }`. Position is the 1-based array index. It holds one sample day of 5 rounds: `transformer-acronyms`, `model-makers`, `benchmark-sizes`, `research-milestones`, `ml-frameworks`.
- `packages/db/src/content.ts`: `roundsSchema` (zod) and type `ContentRound`. Every rule failure is one issue whose message starts with `round <id>:`, except the round count rule, which has no round.
- `packages/db/src/seed.ts`, run with `pnpm db:seed` (root, through turbo) or `pnpm -F @kenpathlabs/db db:seed`. On invalid content it prints `z.prettifyError` and exits 1, before touching the DB.
- Vitest in `packages/db` (`pnpm -F @kenpathlabs/db test`), picked up by root `pnpm test`.

Decisions:

- The seed makes the DB mirror the file in one batch transaction. It deletes statements and rounds whose ids are not in the file, negates every `Round.position`, then upserts everything. A renamed statement id therefore cannot leave a round with 4 statements, and reordering rounds cannot hit the `position` unique index. Deleting content someone has answered fails on the Attempt FK and rolls back the whole seed. Re-running it leaves the tables unchanged (verified by diffing a table dump).
- Ids share one namespace: a round id and a statement id may not be the same string, and a statement id is unique across the file, not just its round. The sample uses slugs: round `model-makers`, statements `model-makers-<slug>`.
- Banned words match whole words, case-insensitively, in `text` only: "Best" fails, "bestselling" passes. Themes and corrections are not checked.
- A truth's `sourceUrl` must be a valid URL starting with `https://`. Empty strings for `id`, `theme`, `text` and `correction` are shape errors.
- The seed runs on Bun (`bun src/seed.ts`), because the generated Prisma client is TypeScript with extensionless imports, which Node cannot run directly. Env comes from `varlock/auto-load`, like `prisma.config.ts`.
- Sample day 1 cites arXiv, vendor pages and Wikipedia. #7 may keep or replace these 5 rounds. Replacing them is safe as long as nobody has answered them yet.

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
