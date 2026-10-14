import "varlock/auto-load";

// Relative import: @kenpathlabs/api depends on this package, so depending back on it is a cycle.
import { addDays, dayKey } from "../../api/src/game/clock";
import { type AttemptRecord, computeHistory } from "../../api/src/game/history";
import { ROUNDS_PER_DAY, roundPositions } from "../../api/src/game/schedule";
import { BOTS, botId, botUser } from "./bots";
import { ENV } from "./env";
import { createPrismaClient } from "./index";

// game.answer's scoring.
const ROUND_POINTS = 10;
const PERFECT_POINTS = 20;
const STREAK_POINTS = 5;
const MAX_STREAK_POINTS = 25;

const yesterday = addDays(dayKey(new Date()), -1);
const db = createPrismaClient(ENV);
const rounds = await db.round.findMany({ include: { statements: true } });
const byPosition = new Map(rounds.map((round) => [round.position, round]));

await db.user.createMany({ data: BOTS.map(botUser), skipDuplicates: true });

let played = 0;
for (const [i, { username }] of BOTS.entries()) {
  const userId = botId(username);
  // Bots higher on the list play more often and pick the fake more often.
  const accuracy = 0.75 - i * 0.02;
  const skipRate = 0.1 + i * 0.02;
  const history: AttemptRecord[] = await db.attempt.findMany({
    where: { userId },
    orderBy: { day: "asc" },
    select: { day: true, correct: true },
  });
  // A new bot starts 20 to 60 days back. An existing one carries on from its last day.
  const after = history.at(-1)?.day ?? addDays(yesterday, -20 - Math.floor(Math.random() * 40));

  const attempts = [];
  const entries = [];
  for (let day = addDays(after, 1); day <= yesterday; day = addDays(day, 1)) {
    if (Math.random() < skipRate) continue;
    const hour = String(9 + Math.floor(Math.random() * 13)).padStart(2, "0");
    const createdAt = new Date(`${day}T${hour}:00:00+05:30`);
    const todays = roundPositions(day).map((position) => {
      const round = byPosition.get(position)!;
      const correct = Math.random() < accuracy;
      const statement = round.statements.find((s) => s.isFake === correct)!;
      return { userId, day, roundId: round.id, statementId: statement.id, correct, createdAt };
    });
    attempts.push(...todays);
    history.push(...todays);

    for (const { roundId, correct } of todays) {
      if (correct)
        entries.push({
          amount: ROUND_POINTS,
          reason: "round",
          ref: `${day}:${roundId}`,
          createdAt,
        });
    }
    if (todays.every((a) => a.correct)) {
      entries.push({ amount: PERFECT_POINTS, reason: "perfect", ref: day, createdAt });
    }
    const streak = computeHistory(history, day).currentStreak;
    const amount = Math.min(STREAK_POINTS * streak, MAX_STREAK_POINTS);
    entries.push({ amount, reason: "streak", ref: day, createdAt });
  }

  await db.$transaction([
    db.attempt.createMany({ data: attempts, skipDuplicates: true }),
    db.pointEntry.createMany({
      data: entries.map((entry) => ({ ...entry, userId })),
      skipDuplicates: true,
    }),
  ]);
  played += attempts.length / ROUNDS_PER_DAY;
}

console.log(`${BOTS.length} bots, ${played} new days played up to ${yesterday}.`);
await db.$disconnect();
