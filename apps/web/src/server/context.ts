import type { Context } from "@kenpathlabs/api/context";

import { auth, db } from "./services";

export async function createContext(req: Request): Promise<Context> {
  const session = await auth.api.getSession({ headers: req.headers });
  return { db, session };
}
