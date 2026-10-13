import { createAuth } from "@kenpathlabs/auth";
import { type Database, createPrismaClient } from "@kenpathlabs/db";

import { ENV } from "@/env";

declare global {
  // Reused across dev hot reloads so each reload does not open a new connection pool.
  var db: Database | undefined;
}

export const db = (globalThis.db ??= createPrismaClient(ENV));
export const auth = createAuth(ENV, db);

// Server reads never extend the session. An extension here would set the new cookie on a response
// the browser never sees, and the client's get-session would then find nothing to extend.
// AnonymousSession calls get-session from the browser instead, where the cookie does get set.
export function readSession(headers: Headers) {
  return auth.api.getSession({ headers, query: { disableRefresh: true } });
}
