import { addDays } from "@kenpathlabs/api/game/clock";

import {
  answerRound,
  currentRound,
  db,
  expect,
  seedPlayedDays,
  setNow,
  status,
  test,
  sessionUser,
} from "./helpers";

test("past midnight the new day's rounds load and the old day's unanswered rounds score 0", async ({
  page,
}) => {
  await setNow(page, "2026-10-14T23:58:00+05:30");
  await page.goto("/play");
  await answerRound(page, "fake");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Round 2/5")).toBeVisible();
  const { fake: unanswered } = await currentRound(page);

  await setNow(page, "2026-10-15T00:01:00+05:30");
  await page.reload();

  await expect(page.getByText("Round 1/5")).toBeVisible();
  await expect(page.getByRole("img", { name: "0 correct, 0 wrong, 5 to play" })).toBeVisible();
  // Yesterday's round is no longer open.
  const late = await page.request.post("/api/trpc/game.answer", {
    data: { roundId: unanswered.roundId, statementId: unanswered.id },
  });
  expect(late.status()).toBe(400);
  const player = (await sessionUser(page)).id;
  expect(await db.attempt.count({ where: { userId: player } })).toBe(1);
  expect(
    await db.pointEntry.findMany({
      where: { userId: player },
      select: { reason: true, amount: true },
    }),
  ).toEqual([{ reason: "round", amount: 10 }]);

  await page.getByRole("link", { name: "Exit" }).click();
  await expect(page.getByTitle("Wed 14 Oct: 1 of 5 correct")).toBeVisible();
  // An unfinished day does not count towards a streak.
  await expect(status(page, "day streak")).toHaveText("0");
});

test("a missed day without a freeze resets the streak", async ({ page }) => {
  await setNow(page, "2026-10-13T12:00:00+05:30");
  await page.goto("/");
  await expect(status(page, "day streak")).toHaveText("0");
  await seedPlayedDays((await sessionUser(page)).id, ["2026-10-11", "2026-10-12"]);
  await page.reload();
  await expect(status(page, "day streak")).toHaveText("2");
  await expect(status(page, "freezes")).toHaveText("0/2");

  // 13 Oct ends unplayed.
  await setNow(page, "2026-10-14T12:00:00+05:30");
  await page.reload();

  await expect(status(page, "day streak")).toHaveText("0");
  await expect(page.getByTitle("Tue 13 Oct: 0 of 5 correct")).toBeVisible();
});

test("a missed day with a freeze uses the freeze and keeps the streak", async ({ page }) => {
  await setNow(page, "2026-10-13T12:00:00+05:30");
  await page.goto("/");
  await expect(status(page, "day streak")).toHaveText("0");
  // 7 days in a row, 6 to 12 Oct, earn a freeze.
  const week = Array.from({ length: 7 }, (_, i) => addDays("2026-10-06", i));
  await seedPlayedDays((await sessionUser(page)).id, week);
  await page.reload();
  await expect(status(page, "day streak")).toHaveText("7");
  await expect(status(page, "freezes")).toHaveText("1/2");

  // 13 Oct ends unplayed.
  await setNow(page, "2026-10-14T12:00:00+05:30");
  await page.reload();

  await expect(status(page, "day streak")).toHaveText("7");
  await expect(status(page, "freezes")).toHaveText("0/2");
  await expect(page.getByTitle("Tue 13 Oct: frozen")).toBeVisible();
});
