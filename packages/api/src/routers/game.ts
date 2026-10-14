import { dayPointEntries, lockUser } from "@kenpathlabs/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { dayKey, nextDayStart, seasonNumber } from "../game/clock";
import { computeHistory } from "../game/history";
import { ROUNDS_PER_DAY, roundPositions, statementOrder } from "../game/schedule";
import { protectedProcedure, router } from "../index";

const ROUND_POINTS = 10;
const PERFECT_POINTS = 20;
const STREAK_POINTS = 5;
const MAX_STREAK_POINTS = 25;

type RevealedStatement = {
  id: string;
  isFake: boolean;
  correction: string | null;
  sourceUrl: string | null;
};

// Content validation guarantees exactly one fake per round.
function reveal(
  statements: RevealedStatement[],
  attempt: { statementId: string; correct: boolean },
) {
  const fake = statements.find((statement) => statement.isFake)!;
  return {
    pickedId: attempt.statementId,
    correct: attempt.correct,
    fakeId: fake.id,
    correction: fake.correction,
    sources: statements
      .filter((statement) => !statement.isFake)
      .map(({ id, sourceUrl }) => ({ statementId: id, url: sourceUrl })),
    points: attempt.correct ? ROUND_POINTS : 0,
  };
}

export const gameRouter = router({
  today: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const day = dayKey(ctx.now);
    const [rounds, attempts] = await Promise.all([
      ctx.db.round.findMany({
        where: { position: { in: roundPositions(day) } },
        orderBy: { position: "asc" },
        // statementOrder shuffles by input position, so the input must be in a fixed order.
        include: { statements: { orderBy: { id: "asc" } } },
      }),
      ctx.db.attempt.findMany({
        where: { userId },
        select: { day: true, roundId: true, statementId: true, correct: true },
      }),
    ]);
    const history = computeHistory(attempts, day);
    const answered = new Map(attempts.filter((a) => a.day === day).map((a) => [a.roundId, a]));

    let done = null;
    if (answered.size === ROUNDS_PER_DAY) {
      const entries = await ctx.db.pointEntry.findMany({
        where: { userId, ...dayPointEntries([day]) },
        select: { reason: true, amount: true },
      });
      const total = (reason: string) =>
        entries.filter((e) => e.reason === reason).reduce((sum, e) => sum + e.amount, 0);
      done = {
        correct: [...answered.values()].filter((a) => a.correct).length,
        points: { round: total("round"), perfect: total("perfect"), streak: total("streak") },
        nextDayStart: nextDayStart(ctx.now).toISOString(),
        serverTime: ctx.now.toISOString(),
      };
    }

    return {
      day,
      season: seasonNumber(ctx.now),
      streak: history.currentStreak,
      freezes: history.freezes,
      graph: history.graph,
      rounds: rounds.map((round, index) => {
        const attempt = answered.get(round.id);
        return {
          id: round.id,
          number: index + 1,
          theme: round.theme,
          statements: statementOrder(round.statements, day, round.id).map((statement, i) => ({
            id: statement.id,
            label: String.fromCharCode(65 + i),
            text: statement.text,
          })),
          result: attempt ? reveal(round.statements, attempt) : null,
        };
      }),
      done,
    };
  }),

  answer: protectedProcedure
    .input(z.object({ roundId: z.string(), statementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const day = dayKey(ctx.now);
      // Stamped with ctx.now, not the DB clock, so the test clock also moves points into its season.
      const createdAt = ctx.now;
      const round = await ctx.db.round.findFirst({
        where: { id: input.roundId, position: { in: roundPositions(day) } },
        include: { statements: true },
      });
      const picked = round?.statements.find((statement) => statement.id === input.statementId);
      if (!round || !picked) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not a statement in today's rounds" });
      }

      const attempt = await ctx.db.$transaction(async (tx) => {
        // Serializes a user's answers, so exactly one of them sees the day's 5th attempt.
        await lockUser(tx, userId);
        const key = { userId, day, roundId: round.id };
        const { count } = await tx.attempt.createMany({
          data: [{ ...key, statementId: picked.id, correct: picked.isFake, createdAt }],
          skipDuplicates: true,
        });
        if (count === 1) {
          const entries: { amount: number; reason: string; ref: string }[] = [];
          if (picked.isFake) {
            entries.push({ amount: ROUND_POINTS, reason: "round", ref: `${day}:${round.id}` });
          }
          const attempts = await tx.attempt.findMany({
            where: { userId },
            select: { day: true, correct: true },
          });
          const todays = attempts.filter((a) => a.day === day);
          if (todays.length === ROUNDS_PER_DAY) {
            if (todays.every((a) => a.correct)) {
              entries.push({ amount: PERFECT_POINTS, reason: "perfect", ref: day });
            }
            // Today is finished, so the streak includes it.
            const streak = computeHistory(attempts, day).currentStreak;
            const amount = Math.min(STREAK_POINTS * streak, MAX_STREAK_POINTS);
            entries.push({ amount, reason: "streak", ref: day });
          }
          await tx.pointEntry.createMany({
            data: entries.map((entry) => ({ ...entry, userId, createdAt })),
            skipDuplicates: true,
          });
        }
        return tx.attempt.findUniqueOrThrow({ where: { userId_day_roundId: key } });
      });

      return reveal(round.statements, attempt);
    }),
});
