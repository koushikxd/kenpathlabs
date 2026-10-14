# Product spec

Hallucinated is a daily "two truths and a hallucination" game about tech, coding and AI, made for developers.

Every day everyone gets the same 5 rounds. Each round has three statements about languages, dev tools, tech news, LLMs or AI coding agents. Two are true and one is made up. You pick the fake, see the truth, earn points and keep your streak going.

How it is built is in [ARCHITECTURE.md](./ARCHITECTURE.md).

## The daily loop

1. Open the app. You play as a guest, with no sign-up.
2. Today shows your streak, your freezes, the season, your activity graph and a Play button.
3. Play opens the game screen. Tap the statement you think is fake.
4. The reveal glitches the fake, strikes it out and shows the correction. The two truths get a source link.
5. After round 5 you get your score, a receipt of the points you earned and a countdown to the next set.

## Rules

### Days

- A day runs midnight to midnight IST (Asia/Kolkata), for everyone. One fixed zone means everyone plays the same set on the same day.
- One attempt per round. No retries.
- If you leave mid-day, you resume at the next unanswered round. Rounds still unanswered at midnight score 0.
- Statement order is shuffled per round, but it is the same for every player.

### Points

| Event             | Points                     |
| ----------------- | -------------------------- |
| Correct round     | +10                        |
| Perfect day (5/5) | +20                        |
| Day completed     | +5 per streak day, max +25 |

There is no speed bonus. Every point is a ledger entry with a reason, and only the server writes them.

### Streaks

- A day counts once all 5 rounds are answered. An unfinished today never breaks yesterday's streak.
- Each time the streak reaches a multiple of 7 you earn a freeze, up to 2 held. A streak rebuilt after a reset earns them again.
- A missed day uses a freeze automatically. A frozen day keeps the streak alive but does not add to it.
- A missed day with no freeze resets the streak to 0.

### Activity graph

A GitHub-style grid of the last 20 weeks, one column per week with Monday on top. A cell's shade is the number of correct rounds that day (0 to 5). Frozen days are blue. A missed day and a 0/5 day look the same.

### Badges

| Badge                | How                             |
| -------------------- | ------------------------------- |
| First Token          | Answer your first round         |
| On Fire              | Reach a 7-day streak            |
| Perfect Week         | 5/5 on 7 calendar days in a row |
| Hallucination Hunter | Catch 50 fakes                  |

Badges stay once earned, even after the streak is lost. A frozen or imperfect day breaks a Perfect Week run.

### Seasons

Each week is a season, Monday 00:00 to Monday 00:00 IST. Season 1 started on Monday 12 October 2026.

- The board ranks players by points earned this season. Ties go to whoever reached the total first.
- While the season runs, #1 holds **da goat** and #2 to #10 hold **10x dev**. Drop out of the top 10 and you lose the badge.
- When the season ends, the final top 10 keep their badge for good. It shows on their profile under Season awards.
- Guests earn points but are not ranked.

### Accounts

- You claim your account with a name, username, email and password. Usernames are 3 to 30 letters, numbers, dots or underscores. Passwords are at least 8 characters.
- Your public profile lives at `/u/<username>`.
- Signing up keeps everything you earned as a guest.
- Signing in to an existing account brings over your guest progress for every day that account has not played. Days move whole, so a day's bonuses always match its answers.
- Signing out starts a new guest session.

## Screens

A floating pill dock at the bottom has **Today**, **Board** and **Me**. It hides on the game screen. The app is built for phones. On desktop it is the same layout in a centred column about 480px wide.

- **Today**: a status row (streak, freezes, season), the activity graph, then a glowing Play button with the day's progress. After the first answer it reads Resume. Once the day is done, the day's result takes its place.
- **Play** (`/play`): an illustration for the round, `Round n/5` with five progress pills (green check, red cross, empty), the theme, and three statements labelled `A`, `B`, `C`.
  - The tapped card shows a spinner until the server answers. The other two fade.
  - The reveal glitches the fake, strikes it out and shows its correction. A wrong pick gets a red cross drawn over it. The truths show a source link. Then Next.
  - Exit goes back to Today. Every answer is already saved, so there is nothing to lose.
- **Day result**: the score out of 5 with a one-line verdict, a receipt with one row per round, then Perfect day and Streak bonus when they apply, then Points earned and a countdown to midnight IST.
- **Board**: the season number and time left, the top 50 with their live badges, a "Badge line" after #10, and your row pinned at the bottom. Guests see "Sign up to appear on the board." instead.
- **Me**: total points, current and longest streak, freezes, the graph, all four badges (unearned ones say "Not yet"), season awards and your last 50 point entries. Guests see the sign-up and sign-in forms above the same sections, so they can see what they would keep.
- **Profile** (`/u/<username>`): what Me shows, minus the ledger and the account buttons. It renders on the server, so it works without JavaScript. Unknown usernames and guests get a real 404.

The 20 seeded demo players carry a `bot` tag everywhere they appear.

## Look and feel

- Dark only.
- Built on the [DESIGN.md](../DESIGN.md) tokens (achromatic shadcn) with one accent on top: violet. Frozen days are sky blue. Green and red only ever mean correct and wrong.
- Monospace for statement labels, points, counters and section labels.
- The glitch is the signature, and it means "wrong, broken or not real". It plays on the fake in the reveal, on "Wrong", on error messages, on "Player not found", on the day's score, and as a short loop on the Play button. It is CSS only (transform and opacity) so it stays smooth on cheap phones, and it turns off under reduced motion.
- Each round shows an isometric line drawing of a machine that stands for an AI idea: a token punch, a patch bay, an accelerator board, a coin sorter, a polygraph and five more. They are static SVG files, decorative only, 12 to 31KB gzipped each.
- Sound and haptics on the answer result and on finishing the day. The sounds are synthesised with Web Audio, so there are no audio files, and they mute under reduced motion. Vibration only works on Android Chrome.
- Phone details: 44px touch targets, 16px inputs so iOS does not zoom, no tap flash, no pull-to-refresh mid-round, and content kept clear of the notch.
- Plain copy: "Correct", "Wrong", "Your answer", "New rounds in".

## Content

70 rounds (14 days) in `content/rounds.json`. After day 14 the schedule loops.

The bar is "would an active dev on X know this?". Rounds are viral moments, launches and dev folklore, not benchmark scores or parameter counts. They come from five topics, and every day gets one round from each:

- Languages and frameworks: JavaScript's 10-day origin, TypeScript's compiler moving to Go, Bun and Deno.
- Dev tools and open source: the xz backdoor, left-pad, Vim's charity, WordPress vs WP Engine.
- Big tech and startups: the CrowdStrike outage, startup pivots, deals that died.
- LLMs and AI labs: Bard's telescope blunder, the DeepSeek shock, the Ghibli wave.
- AI coding tools: vibe coding, the Windsurf saga, Replit's deleted database, MCP and AGENTS.md.

Each round is a themed set of three, so the fake does not stand out by topic. Statements follow these rules:

- Never "best", "latest" or "currently". Name the exact product or version so a statement stays true.
- No dates or years in the statement text.
- Truths carry an `https` source link. Fakes carry a correction.
- A fake changes one detail of a real story: who, which company, the outcome, or the name. It should make you pause, but anyone who saw the story should catch it.

Every truth and every correction was checked by opening its source and finding the supporting sentence.

The seed script rejects content that breaks the mechanical rules: 3 statements, exactly one fake, a source on each truth, a correction on each fake, and none of the banned words.

## Out of scope

- Live news. X has had no free API since February 2026 and scraping it is unreliable, so the content is a curated, sourced dataset instead.
- Hiding the answer key. The repo is public, so `content/rounds.json` is readable.
