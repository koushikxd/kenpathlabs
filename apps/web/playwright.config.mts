import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

import { BASE_URL, DATABASE_URL, PORT } from "./e2e/env";

// A clean checkout has no Prisma client yet, and the web server and global setup both need one.
// Only when missing: regenerating under a running `next dev` makes it recompile.
if (!existsSync(new URL("../../packages/db/prisma/generated", import.meta.url))) {
  execFileSync("pnpm", ["-F", "@kenpathlabs/db", "db:generate"], {
    env: { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL },
    stdio: "inherit",
  });
}

export default defineConfig({
  testDir: "e2e",
  // Every test's trace and final screenshot land here, one folder per test. Cleared each run.
  outputDir: "test-results",
  globalSetup: "./e2e/global-setup.ts",
  // next dev compiles a route on its first visit, and the network is throttled.
  timeout: 60_000,
  reporter: "list",
  use: {
    ...devices["Pixel 5"],
    baseURL: BASE_URL,
    trace: "on",
    screenshot: "on",
    // The app turns its animations off for this, so the final screenshot shows the settled screen
    // and clicks do not wait for entrances. Opt back in per file with `test.use`.
    reducedMotion: "reduce",
  },
  webServer: {
    // next dev, not a production build: the x-test-now clock is compiled out of production builds.
    // Its own distDir lets it run beside the dev server, which locks .next/dev.
    command: `pnpm exec next dev --port ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      DATABASE_URL,
      DIRECT_URL: DATABASE_URL,
      BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
      BETTER_AUTH_URL: BASE_URL,
      ALLOW_TEST_CLOCK: "true",
    },
  },
});
