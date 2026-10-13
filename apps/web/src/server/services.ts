import { createAuth } from "@kenpathlabs/auth";
import { type Database, createPrismaClient } from "@kenpathlabs/db";

import { ENV } from "@/env";

declare global {
  // Reused across dev hot reloads so each reload does not open a new connection pool.
  var db: Database | undefined;
}

export const db = (globalThis.db ??= createPrismaClient(ENV));
export const auth = createAuth(ENV, db);
