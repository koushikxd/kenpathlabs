# Hallucinated

A daily "two truths and a hallucination" game about the AI era, for developers.

Every day, everyone gets the same 5 rounds. Each round has 3 statements about models, benchmarks, tools or companies. Two are true, one is made up. Pick the fake, see the truth, earn points, keep your streak.

## Daily loop

1. Open the app. You play anonymously, no sign-up needed.
2. Today shows your streak, your activity graph and the day's 5 rounds.
3. Tap the statement you think is fake.
4. The reveal shows the fake with a one-line correction, and the truths with source links.
5. After round 5 you see your score, points earned and a countdown to the next set.

## Rules

### Days

- A day runs midnight to midnight, Asia/Kolkata, for everyone.
- One attempt per round. No retries.
- Leaving mid-day resumes at the next unanswered round. Rounds left unanswered at midnight score 0.
- Statement order is shuffled per round but is the same for every player.

### Points

| Event             | Points                     |
| ----------------- | -------------------------- |
| Correct round     | +10                        |
| Perfect day (5/5) | +20                        |
| Day completed     | +5 per streak day, max +25 |

There is no speed bonus. Every point is a ledger entry with a reason, and only the server creates them.

### Streaks

- A day counts once all 5 rounds are answered.
- Every 7 days of streak earns a freeze, up to 2 held.
- A missed day uses a freeze automatically. A frozen day keeps the streak but doesn't add to it.
- A missed day without a freeze resets the streak.

### Activity graph

A GitHub-style grid of the last 20 weeks. Each cell's shade is the number of correct rounds that day (0 to 5). Frozen days have their own colour.

### Badges

| Badge                | How                     |
| -------------------- | ----------------------- |
| First Token          | Answer your first round |
| On Fire              | Reach a 7-day streak    |
| Perfect Week         | 7 days in a row at 5/5  |
| Hallucination Hunter | Catch 50 fakes          |

### Seasons

Each week is a season, Monday 00:00 to Monday 00:00 IST.

- The leaderboard ranks players by points earned this season. Ties go to whoever reached the total first.
- While the season runs, #1 holds **da goat** and #2 to #10 hold **10x dev**. Drop out of the rank and you lose the badge.
- When the season ends, the final top 10 keep it permanently on their profile, e.g. "Season 3 · da goat".
- Anonymous players earn points but aren't ranked.

### Accounts

- Claim your account with name, username, email and password. Your profile lives at `/u/<username>`.
- Signing up keeps everything you earned anonymously.
- Signing in to an existing account merges anonymous progress for any day the account hasn't played.
- Signing out starts a new anonymous session.

## Screens

A floating pill dock at the bottom: **Today**, **Board**, **Me**. Desktop uses the same layout in a centred column about 480px wide.

- **Today**: streak, freezes, season, activity graph, then the current round or the day's result.
  - A round card shows the round number (1/5), the theme, and three statements labelled `A`, `B`, `C`.
  - The tapped card shows a pending state until the server responds.
  - The reveal glitches the fake and shows its correction. Truths show a source link. Then "Next".
  - The done state shows the day's score, points broken down by reason, and a countdown to midnight IST.
- **Board**: season number and time left, ranked players with live badges, your row pinned at the bottom. Anonymous players see a prompt to claim their account instead.
- **Me**: total points, streaks, badges, season awards, points ledger, sign up / sign in / sign out.
- **Profile** (`/u/<username>`): what Me shows, minus the ledger.

Seeded demo players carry a `bot` tag everywhere they appear.

## Visual direction

- Built on the DESIGN.md tokens (achromatic shadcn).
- One accent colour on top.
- Monospace for statement labels, points and counters.
- The hallucination reveal plays a short glitch animation, CSS only (transform and opacity) so it stays smooth on low-end phones.
- Follows the system light or dark theme, no toggle.
- No images in the game loop. Icons come from `lucide-react`.

## Content

70 rounds (14 days), looping after that, in `content/rounds.json`.

Each round is a themed set of three, so the fake doesn't stand out by topic. Statements follow these rules:

- Name the exact version, benchmark or product. Never "best", "latest" or "currently". "Claude Opus 4.5 beat GPT-5.1 on SWE-bench Verified" stays true. "Opus is the best coding model" doesn't.
- No dates shown to players.
- Truths carry a source link. Fakes carry a correction.
- Fakes change one detail of a real fact: the company, the winner, the number, or a model that doesn't exist.

## Out of scope

- Email verification and password reset
- Levels
- Sharing
- Offline mode
- Live news. X has no free API since February 2026 and scraping it is unreliable, so the content is a curated, sourced dataset instead.
- Hiding the answer key. The repo is public, so `content/rounds.json` is readable.
