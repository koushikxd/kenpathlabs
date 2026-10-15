# Explainer

What I built, the choices I made, and what I left out. The full rules are in [PROJECT_SPEC.md](./PROJECT_SPEC.md) and the build in [ARCHITECTURE.md](./ARCHITECTURE.md).

## What I built

Hallucinated is a daily "two truths and a hallucination" game for developers, about tech, coding and AI.

I got the idea from being tired of LLMs confidently making things up. I wanted to turn that around into a game: you get three statements, two are true, one is a hallucination, and you have to catch it.

Every day everyone gets the same 5 rounds, new at midnight IST. You tap the statement you think is fake. The fake glitches and gets struck out with its correction, and the truths show a source link. After 5 rounds you get your score, a receipt of the points you earned and a countdown to tomorrow.

What brings you back:

- **Points**: +10 per correct round, +20 for a perfect day, and a streak bonus.
- **Streaks with freezes**: finish all 5 to keep the streak. Every 7 days earns a freeze, which covers a missed day.
- **Weekly seasons**: the board resets every Monday. #1 gets **da goat**, #2 to #10 get **10x dev**, and the final top 10 keep it on their profile.
- **Badges** and a **GitHub-style activity graph** on your profile.

It is live at [hallucinated.vercel.app](https://hallucinated.vercel.app).

## The choices I made

Most of my choices come down to keeping things simple.

- **Curated content instead of live news.** The 70 rounds are a hand-checked dataset in `content/rounds.json`, and every truth has a source. Pulling and fact-checking news automatically is a whole system of its own, and X has no free API anymore. A news pipeline can be added later without changing the game.
- **The GitHub contribution graph.** Developers already know it, and filling in green squares is about the most rewarding thing a dev looks at. I didn't need to teach anyone what it means.
- **Bots on the board.** A new game has no other players, and an empty leaderboard is a dead one. 20 seeded bots, each with their own played history, make the board feel alive. They carry a `bot` tag everywhere, so nobody is fooled.
- **Play first, sign up later.** You play as a guest from the first tap. Signing up keeps everything you earned, so the sign-up form never stands between you and the game.
- **The server owns the points.** The client only sends which statement you picked. It never knows the answer until it has answered, and every point is written by the server in one transaction, so double taps and retries can't score twice.
- **Streaks are computed, not stored.** I work them out from your answers every time, so they can never drift out of sync.
- **One time zone for everyone.** IST for all, so everyone plays the same set on the same day and the board is fair.
- **No cron job.** A finished season is wrapped up by the first request that reads the board after it ends.
- **One Next.js app** for the pages, API and auth, on Neon Postgres and Vercel. One thing to deploy and no CORS.
- **Phone first.** It is a daily habit game, so I built it for phones and tested it on an emulated Pixel 5 over slow 4G.

## What I left out

- **Live news.** The content loops after 14 days. More rounds, or a news pipeline, is the obvious next step.
- **A hidden answer key.** The repo is public, so `content/rounds.json` can be read by anyone who looks.
- **Email verification, password reset and social login.** Email and password is enough to claim an account for now.
- **Notifications.** No push or email reminder to come back and keep your streak.
- **Real devices.** I measured on emulated phones. Safe areas and haptics still need a check on a real one.
