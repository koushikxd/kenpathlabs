import type { Context } from "@kenpathlabs/api/context";

import { ENV } from "@/env";

import { db, readSession } from "./services";

export async function createContext(req: Request): Promise<Context> {
  const session = await readSession(req.headers);
  return { db, session, now: serverNow(req) };
}

// Next inlines NODE_ENV at build time, so a production build drops the header branch entirely.
function serverNow(req: Request) {
  const testNow = req.headers.get("x-test-now");
  if (process.env.NODE_ENV !== "production" && ENV.ALLOW_TEST_CLOCK && testNow) {
    return new Date(testNow);
  }
  return new Date();
}
