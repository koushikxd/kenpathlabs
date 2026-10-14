import "varlock/auto-load";

// Relative import: @kenpathlabs/api depends on this package, so depending back on it is a cycle.
import { seasonNumber } from "../../api/src/game/clock";
import { BOTS, botId, botUser } from "./bots";
import { ENV } from "./env";
import { createPrismaClient } from "./index";

// An optional date argument seeds the season at that moment instead of now (the E2E test clock).
const now = new Date(process.argv[2] ?? Date.now());
const season = seasonNumber(now);
const db = createPrismaClient(ENV);

// skipDuplicates makes a re-run a no-op. If a real user holds a bot's username or email, that bot
// is skipped and its point entry fails on the FK, rolling back the whole batch.
const [users, entries] = await db.$transaction([
  db.user.createMany({
    data: BOTS.map(botUser),
    skipDuplicates: true,
  }),
  db.pointEntry.createMany({
    data: BOTS.map(({ username, amount }) => ({
      userId: botId(username),
      amount,
      reason: "seed",
      ref: String(season),
      createdAt: now,
    })),
    skipDuplicates: true,
  }),
]);

console.log(`Season ${season}: ${users.count} new bots, ${entries.count} new seed entries.`);
await db.$disconnect();
