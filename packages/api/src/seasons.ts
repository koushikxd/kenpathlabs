import type { Database } from "@kenpathlabs/db";

import { seasonNumber, seasonWindow } from "./game/clock";
import { type SeasonTotal, rankSeason } from "./game/ranking";

export type Standing = SeasonTotal & { name: string; username: string | null; isBot: boolean };

const AWARDS = 10;
// An answer stamped just before a season ends may still be in its transaction when the season ends.
const FINALIZE_DELAY = 60 * 1000;

export async function seasonStandings(db: Pick<Database, "$queryRaw">, n: number) {
  const { start, end } = seasonWindow(n);
  // SUM is bigint in Postgres, which Prisma returns as BigInt, hence ::int.
  const totals = await db.$queryRaw<Standing[]>`
    SELECT u.id AS "userId", u.name, u.username, u."isBot",
           COALESCE(u."isAnonymous", false) AS "isAnonymous",
           SUM(p.amount)::int AS points, MAX(p."createdAt") AS "reachedAt"
    FROM "PointEntry" p JOIN "user" u ON u.id = p."userId"
    WHERE p."createdAt" >= ${start} AND p."createdAt" < ${end}
    GROUP BY u.id`;
  return rankSeason(totals);
}

export async function finalizeEndedSeasons(db: Database, now: Date) {
  const current = seasonNumber(new Date(now.getTime() - FINALIZE_DELAY));
  const finalized = await db.season.findMany({
    where: { number: { lt: current } },
    select: { number: true },
  });
  const done = new Set(finalized.map((season) => season.number));
  for (let n = 1; n < current; n++) {
    if (done.has(n)) continue;
    await db.$transaction(async (tx) => {
      // ON CONFLICT, not a caught unique error, because an error aborts the transaction.
      // A concurrent insert of the same number waits for this one, then writes nothing.
      const { count } = await tx.season.createMany({ data: [{ number: n }], skipDuplicates: true });
      if (count === 0) return;
      const top = (await seasonStandings(tx, n)).slice(0, AWARDS);
      await tx.seasonAward.createMany({
        data: top.map((row) => ({
          seasonNumber: n,
          userId: row.userId,
          award: row.badge!,
          rank: row.rank,
        })),
      });
    });
  }
}
