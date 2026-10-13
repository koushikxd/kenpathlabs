import { protectedProcedure, publicProcedure, router } from "../index";
import { boardRouter } from "./board";
import { gameRouter } from "./game";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  game: gameRouter,
  board: boardRouter,
});
export type AppRouter = typeof appRouter;
