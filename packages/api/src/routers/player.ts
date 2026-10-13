import type { Database } from "@kenpathlabs/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { dayKey, seasonNumber } from "../game/clock";
import { computeHistory } from "../game/history";
import { protectedProcedure, publicProcedure, router } from "../index";
import { finalizeEndedSeasons, seasonStandings } from "../seasons";

const LEDGER_ENTRIES = 50;

type Player = { id: string; name: string; username: string | null };

async function playerSummary(db: Database, player: Player, now: Date) {
  await finalizeEndedSeasons(db, now);
  const [attempts, total, seasonAwards, standings] = await Promise.all([
    db.attempt.findMany({ where: { userId: player.id }, select: { day: true, correct: true } }),
    db.pointEntry.aggregate({ where: { userId: player.id }, _sum: { amount: true } }),
    db.seasonAward.findMany({
      where: { userId: player.id },
      orderBy: { seasonNumber: "desc" },
      select: { seasonNumber: true, award: true },
    }),
    seasonStandings(db, seasonNumber(now)),
  ]);
  return {
    name: player.name,
    username: player.username,
    points: total._sum.amount ?? 0,
    ...computeHistory(attempts, dayKey(now)),
    rankBadge: standings.find((row) => row.userId === player.id)?.badge ?? null,
    seasonAwards,
  };
}

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx.session;
    const [summary, ledger] = await Promise.all([
      playerSummary(
        ctx.db,
        { id: user.id, name: user.name, username: user.username ?? null },
        ctx.now,
      ),
      ctx.db.pointEntry.findMany({
        where: { userId: user.id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: LEDGER_ENTRIES,
        select: { amount: true, reason: true, ref: true, createdAt: true },
      }),
    ]);
    return {
      ...summary,
      isAnonymous: user.isAnonymous === true,
      ledger: ledger.map((entry) => ({ ...entry, createdAt: entry.createdAt.toISOString() })),
    };
  }),
});

export const profileRouter = router({
  byUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      // The username plugin stores usernames lowercased.
      const user = await ctx.db.user.findUnique({
        where: { username: input.username.toLowerCase() },
        select: { id: true, name: true, username: true, isBot: true, isAnonymous: true },
      });
      // Better-Auth lets an anonymous user set a username, but anonymous users have no profile.
      if (!user || user.isAnonymous)
        throw new TRPCError({ code: "NOT_FOUND", message: "No such player" });
      return { ...(await playerSummary(ctx.db, user, ctx.now)), isBot: user.isBot };
    }),
});
