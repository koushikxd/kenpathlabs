import { createAuth } from "@kenpathlabs/auth";
import { type Database, createPrismaClient } from "@kenpathlabs/db";

import { env } from "./env.server";

const db = createPrismaClient(env);

export function getDb(): Database {
  return db;
}
export const auth = createAuth(env, db);
