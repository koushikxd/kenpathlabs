export type RankBadge = "goat" | "10x"; // same strings as SeasonAward.award
export type SeasonTotal = { userId: string; points: number; reachedAt: Date; isAnonymous: boolean };
export type Ranked<T extends SeasonTotal> = T & { rank: number; badge: RankBadge | null };

const TOP = 10;

// Season awards are the first 10 rows, with `badge` as the award.
export function rankSeason<T extends SeasonTotal>(totals: readonly T[]): Ranked<T>[] {
  return totals
    .filter((total) => !total.isAnonymous && total.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.reachedAt.getTime() - b.reachedAt.getTime() ||
        a.userId.localeCompare(b.userId),
    )
    .map((total, i) => ({
      ...total,
      rank: i + 1,
      badge: i === 0 ? "goat" : i < TOP ? "10x" : null,
    }));
}
