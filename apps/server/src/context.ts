import type { Context as ApiContext } from "@kenpathlabs/api/context";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { fromNodeHeaders } from "better-auth/node";

import { getDb } from "./services";
import { auth } from "./services";

export async function createContext(opts: CreateExpressContextOptions): Promise<ApiContext> {
  const db = await getDb();
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(opts.req.headers),
  });
  return {
    db,
    auth: null,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
