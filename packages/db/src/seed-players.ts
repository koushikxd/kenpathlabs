import "varlock/auto-load";

// Relative import: @kenpathlabs/api depends on this package, so depending back on it is a cycle.
import { seasonNumber } from "../../api/src/game/clock";
import { ENV } from "./env";
import { createPrismaClient } from "./index";

// Rank 10 (170) is passed by a perfect player on day 3 and a 4/5 player on day 4.
const BOTS = [
  { name: "Priya Raman", username: "priya.ships", amount: 420 },
  { name: "Marcus Chen", username: "segfault_marcus", amount: 365 },
  { name: "Ana Souza", username: "ana_rebases", amount: 330 },
  { name: "Tom Becker", username: "tbecker_dev", amount: 295 },
  { name: "Aisha Khan", username: "aisha.k8s", amount: 260 },
  { name: "Diego Morales", username: "diego_yaml", amount: 240 },
  { name: "Yuki Tanaka", username: "yuki_tensor", amount: 215 },
  { name: "Sam Okafor", username: "sam_ok_404", amount: 200 },
  { name: "Lena Fischer", username: "lena.lambda", amount: 185 },
  { name: "Arjun Mehta", username: "arjun_gradient", amount: 170 },
  { name: "Chloe Martin", username: "chloe_cuda", amount: 150 },
  { name: "Omar Haddad", username: "omar.monorepo", amount: 135 },
  { name: "Nina Petrova", username: "nina_nullable", amount: 120 },
  { name: "Kofi Mensah", username: "kofi_kernel", amount: 105 },
  { name: "Hannah Lee", username: "hlee_vim", amount: 90 },
  { name: "Ravi Iyer", username: "ravi.regex", amount: 75 },
  { name: "Sofia Rossi", username: "sofia_async", amount: 60 },
  { name: "Ben Carter", username: "bcarter_ops", amount: 45 },
  { name: "Mei Lin", username: "mei_tokenizer", amount: 30 },
  { name: "Jonas Berg", username: "jonas.dotfiles", amount: 15 },
];

// An optional date argument seeds the season at that moment instead of now (the E2E test clock).
const now = new Date(process.argv[2] ?? Date.now());
const season = seasonNumber(now);
const db = createPrismaClient(ENV);

// skipDuplicates makes a re-run a no-op. If a real user holds a bot's username or email, that bot
// is skipped and its point entry fails on the FK, rolling back the whole batch.
const [users, entries] = await db.$transaction([
  db.user.createMany({
    data: BOTS.map(({ name, username }) => ({
      id: `bot-${username}`,
      name,
      email: `${username}@bots.invalid`,
      username,
      displayUsername: username,
      isBot: true,
    })),
    skipDuplicates: true,
  }),
  db.pointEntry.createMany({
    data: BOTS.map(({ username, amount }) => ({
      userId: `bot-${username}`,
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
