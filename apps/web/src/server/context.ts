import type { Context } from "@kenpathlabs/api/context";

import { ENV } from "@/env";

import { db, readSession } from "./services";

// Takes headers, not a Request, so server components can call procedures too.
export async function createContext(headers: Headers): Promise<Context> {
  const session = await readSession(headers);
  return { db, session, now: serverNow(headers) };
}

// Next inlines NODE_ENV at build time, so a production build drops the header branch entirely.
function serverNow(headers: Headers) {
  const testNow = headers.get("x-test-now");
  if (process.env.NODE_ENV !== "production" && ENV.ALLOW_TEST_CLOCK && testNow) {
    return new Date(testNow);
  }
  return new Date();
}
