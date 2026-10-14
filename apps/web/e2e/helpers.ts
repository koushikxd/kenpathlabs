import { randomBytes } from "node:crypto";

import { roundPositions } from "@kenpathlabs/api/game/schedule";
import { createPrismaClient } from "@kenpathlabs/db";
import { test as base, type Browser, expect, type Page } from "@playwright/test";

import { DATABASE_URL, NOW } from "./env";

export { expect };

// The test database, for reading content and setting up state directly.
export const db = createPrismaClient({ DATABASE_URL });

// Slow 4G as Lighthouse defines it: 150ms round trip, 1.6Mbps down, 750Kbps up.
const SLOW_4G = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};

// Fixes the server clock at `now`, throttles the network and hides the dev overlays.
async function preparePage(page: Page, now: string) {
  await setNow(page, now);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.emulateNetworkConditions", SLOW_4G);
  // next dev's indicator and the React Query devtools button cover the dock and the Next button.
  // Neither ships in production.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal, .tsqd-parent-container { display: none !important; }";
      document.head.append(style);
    });
  });
}

// Every test gets a fresh context (a new anonymous player), a throttled network and the server
// clock fixed at `now`. Override it per file with `test.use({ now: "..." })`.
export const test = base.extend<{ now: string }>({
  now: [NOW, { option: true }],
  page: async ({ page, now }, use) => {
    await preparePage(page, now);
    await use(page);
  },
});

// Moves the server clock for every later request from this page's context. Takes any
// Date-parsable string, e.g. "2026-10-15T09:00:00+05:30". Reload to see the new day.
export function setNow(page: Page, when: string) {
  return page.context().setExtraHTTPHeaders({ "x-test-now": when });
}

// The statements of the round on screen in /play, found by its theme (themes are unique).
export async function currentRound(page: Page) {
  const theme = (await page.locator("#round-theme").textContent()) ?? "";
  const [fake, truths] = await Promise.all([
    db.statement.findFirstOrThrow({ where: { round: { theme }, isFake: true } }),
    db.statement.findMany({ where: { round: { theme }, isFake: false } }),
  ]);
  return { fake, truths };
}

// Taps the fake or a truth in the round on screen and waits for the reveal. Does not press Next.
export async function answerRound(page: Page, pick: "fake" | "truth") {
  const { fake, truths } = await currentRound(page);
  const target = pick === "fake" ? fake : truths[0];
  await page.getByRole("button", { name: target.text }).click();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
}

// A second player in the same test: a fresh context (a new anonymous player), set up like `page`.
// Playwright gives it the config's device and baseURL, and traces and screenshots it too.
export async function newPlayer(browser: Browser, now = NOW) {
  const page = await (await browser.newContext()).newPage();
  await preparePage(page, now);
  return page;
}

// The page's session user, from Better-Auth.
export async function sessionUser(page: Page): Promise<{ id: string; isAnonymous: boolean }> {
  const session: { user: { id: string; isAnonymous: boolean } } = await (
    await page.request.get("/api/auth/get-session")
  ).json();
  return session.user;
}

export type Account = { name: string; username: string; email: string; password: string };

// Signs up a new account through the form on Me, unique per call, and waits for the signed-in view.
// The name is the username, so it is unique too.
export async function signUp(page: Page): Promise<Account> {
  const username = `e2e_${randomBytes(6).toString("hex")}`;
  const account = {
    name: username,
    username,
    email: `${username}@e2e.invalid`,
    password: "correct-horse",
  };
  await page.goto("/me");
  await page.getByLabel("Name", { exact: true }).fill(account.name);
  await page.getByLabel("Username").fill(account.username);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign up", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  return account;
}

// Signs in through the form on Me and waits for the signed-in view.
export async function signIn(page: Page, { email, password }: Pick<Account, "email" | "password">) {
  await page.goto("/me");
  // The form opens on sign-up: this "Sign in" is the switch, after which it is the submit.
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

// Signs out on Me and waits for the guest view of the new anonymous session.
export async function signOut(page: Page) {
  await page.goto("/me");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Guest" })).toBeVisible();
}

// Writes finished days straight to the DB: each day's 5 scheduled rounds answered, all correct.
// No point entries: streaks, freezes and the graph are computed from attempts alone.
export async function seedPlayedDays(userId: string, days: string[]) {
  for (const day of days) {
    const rounds = await db.round.findMany({
      where: { position: { in: roundPositions(day) } },
      include: { statements: { where: { isFake: true } } },
    });
    await db.attempt.createMany({
      data: rounds.map((round) => ({
        userId,
        day,
        roundId: round.id,
        statementId: round.statements[0].id,
        correct: true,
      })),
    });
  }
}

// A value in Today's status row, by its label: "day streak", "freezes" or "season".
export function status(page: Page, label: string) {
  return page
    .getByRole("region", { name: "Your status" })
    .locator("div")
    .filter({ has: page.getByText(label, { exact: true }) })
    .getByRole("definition");
}
