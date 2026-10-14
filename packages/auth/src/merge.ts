import { type Database, dayPointEntries, lockUser } from "@kenpathlabs/db";

// Moves whole days the target account has not played, so a day's bonuses stay with its answers.
// Whatever stays behind is cascade-deleted with the anonymous user.
export function mergeAnonymousProgress(db: Database, fromUserId: string, toUserId: string) {
  return db.$transaction(async (tx) => {
    // So an answer on another device cannot finish a day mid-merge.
    await lockUser(tx, toUserId);
    const played = await tx.attempt.findMany({
      where: { userId: fromUserId },
      distinct: ["day"],
      select: { day: true },
    });
    const taken = await tx.attempt.findMany({
      where: { userId: toUserId, day: { in: played.map(({ day }) => day) } },
      distinct: ["day"],
      select: { day: true },
    });
    const takenDays = new Set(taken.map(({ day }) => day));
    const days = played.map(({ day }) => day).filter((day) => !takenDays.has(day));
    if (days.length === 0) return;

    await tx.attempt.updateMany({
      where: { userId: fromUserId, day: { in: days } },
      data: { userId: toUserId },
    });
    await tx.pointEntry.updateMany({
      where: { userId: fromUserId, ...dayPointEntries(days) },
      data: { userId: toUserId },
    });
  });
}
