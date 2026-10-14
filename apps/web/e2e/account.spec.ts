import type { Page } from "@playwright/test";

import {
  answerRound,
  currentRound,
  db,
  expect,
  newPlayer,
  sessionUser,
  setNow,
  signIn,
  signOut,
  signUp,
  test,
} from "./helpers";

// Day A is the default clock (Wednesday 14 Oct), day B the day after.
const DAY_B = "2026-10-15T12:00:00+05:30";

// The first stat on Me.
function points(page: Page) {
  return page.getByRole("region", { name: "Stats" }).getByRole("definition").first();
}

// Everything Me shows of a player's progress: stats, activity graph and points ledger.
function progress(page: Page) {
  return Promise.all(
    ["Stats", "Last 20 weeks", "Recent points"].map((name) =>
      page.getByRole("region", { name }).textContent(),
    ),
  );
}

function attempts(userId: string) {
  return db.attempt.findMany({
    where: { userId },
    orderBy: { day: "asc" },
    select: { day: true, statementId: true },
  });
}

test("play anonymously, sign up: points and graph unchanged on Me", async ({ page }) => {
  await page.goto("/play");
  await answerRound(page, "fake");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Round 2/5")).toBeVisible();
  await answerRound(page, "truth");
  await page.goto("/me");
  await expect(points(page)).toHaveText("10");
  await expect(page.getByText("Today, Wed 14 Oct: 1 of 5 correct")).toHaveCount(1);
  const before = await progress(page);
  const guest = await sessionUser(page);

  const account = await signUp(page);

  await expect(page.getByRole("heading", { name: account.name })).toBeVisible();
  await expect(points(page)).toHaveText("10");
  expect(await progress(page)).toEqual(before);
  // The answers moved to the account, and the anonymous user is gone.
  const user = await sessionUser(page);
  expect(user.isAnonymous).toBe(false);
  expect(await attempts(user.id)).toHaveLength(2);
  expect(await db.user.findUnique({ where: { id: guest.id } })).toBeNull();
});

test("sign in adds the days the account has not played and keeps its own", async ({
  page,
  browser,
}) => {
  // The account gets round 1 of day A right.
  const account = await signUp(page);
  const { id } = await sessionUser(page);
  await page.goto("/play");
  const dayA = await currentRound(page);
  await answerRound(page, "fake");

  // In another browser, a guest gets round 1 of day A wrong, then round 1 of day B right.
  const guest = await newPlayer(browser);
  await guest.goto("/play");
  await answerRound(guest, "truth");
  await setNow(guest, DAY_B);
  await guest.goto("/play");
  const dayB = await currentRound(guest);
  await answerRound(guest, "fake");

  await signIn(guest, account);

  // 10 for the account's own day A, 10 for the guest's day B.
  await expect(points(guest)).toHaveText("20");
  await expect(guest.getByText("Wed 14 Oct: 1 of 5 correct", { exact: true })).toHaveCount(1);
  await expect(guest.getByText("Today, Thu 15 Oct: 1 of 5 correct")).toHaveCount(1);
  expect(await attempts(id)).toEqual([
    { day: "2026-10-14", statementId: dayA.fake.id },
    { day: "2026-10-15", statementId: dayB.fake.id },
  ]);
  await guest.context().close();
});

test("sign out starts a guest with zero points, signing back in finds the account untouched", async ({
  page,
}) => {
  const account = await signUp(page);
  const user = await sessionUser(page);
  await page.goto("/play");
  await answerRound(page, "fake");
  await page.goto("/me");
  await expect(points(page)).toHaveText("10");
  const before = await progress(page);
  const saved = await attempts(user.id);

  await signOut(page);

  await expect(points(page)).toHaveText("0");
  const guest = await sessionUser(page);
  expect(guest.isAnonymous).toBe(true);
  expect(guest.id).not.toBe(user.id);

  await signIn(page, account);

  await expect(points(page)).toHaveText("10");
  expect(await progress(page)).toEqual(before);
  expect(await attempts(user.id)).toEqual(saved);
});
