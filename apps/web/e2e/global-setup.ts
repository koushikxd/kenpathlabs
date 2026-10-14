import { execFileSync } from "node:child_process";
import path from "node:path";

import { createPrismaClient } from "@kenpathlabs/db";

import { ADMIN_URL, BASE_URL, DATABASE_URL, DB_NAME, NOW } from "./env";

const DB_DIR = path.join(import.meta.dirname, "../../../packages/db");

// A fresh test database each run: drop, create, migrate, then seed the rounds and the bots.
// Dropping by hand, not `prisma migrate reset`, keeps it to this one database and needs no prompt.
export default async function globalSetup() {
  const admin = createPrismaClient({ DATABASE_URL: ADMIN_URL });
  await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE)`);
  await admin.$executeRawUnsafe(`CREATE DATABASE "${DB_NAME}"`);
  await admin.$disconnect();

  const env = { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL };
  const run = (...args: string[]) =>
    execFileSync("pnpm", args, { cwd: DB_DIR, env, stdio: "inherit" });
  run("exec", "prisma", "migrate", "deploy");
  run("run", "db:seed");
  // Bots score in the season of the test clock, not of the real date.
  run("run", "db:seed:players", NOW);

  // next dev compiles a route on its first request. Do it here, unthrottled, not in a test's time.
  for (const route of ["/", "/play"]) await fetch(BASE_URL + route);
}
