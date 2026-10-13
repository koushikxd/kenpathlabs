import type { createAuth } from "@kenpathlabs/auth";
import type { Database } from "@kenpathlabs/db";

export type Context = {
  auth: null;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  db: Database;
};
