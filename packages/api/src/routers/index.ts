import { router } from "../index";
import { boardRouter } from "./board";
import { gameRouter } from "./game";
import { meRouter, profileRouter } from "./player";

export const appRouter = router({
  game: gameRouter,
  board: boardRouter,
  me: meRouter,
  profile: profileRouter,
});
export type AppRouter = typeof appRouter;
