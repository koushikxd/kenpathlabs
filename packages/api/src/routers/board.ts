import { seasonNumber, seasonWindow } from "../game/clock";
import { publicProcedure, router } from "../index";
import { type Standing, finalizeEndedSeasons, seasonStandings } from "../seasons";
import type { Ranked } from "../game/ranking";

const BOARD_ROWS = 50;

// No user ids leave the server. `rank` is unique, so it is the row key.
function toRow({ rank, name, username, isBot, points, badge }: Ranked<Standing>) {
  return { rank, name, username, isBot, points, badge };
}

export const boardRouter = router({
  season: publicProcedure.query(async ({ ctx }) => {
    await finalizeEndedSeasons(ctx.db, ctx.now);
    const season = seasonNumber(ctx.now);
    const standings = await seasonStandings(ctx.db, season);
    const user = ctx.session?.user;
    const isAnonymous = !user || user.isAnonymous === true;
    const mine = isAnonymous ? undefined : standings.find((row) => row.userId === user.id);
    return {
      season,
      endsAt: seasonWindow(season).end.toISOString(),
      serverTime: ctx.now.toISOString(),
      rows: standings.slice(0, BOARD_ROWS).map(toRow),
      me: mine ? toRow(mine) : null,
      isAnonymous,
    };
  }),
});
