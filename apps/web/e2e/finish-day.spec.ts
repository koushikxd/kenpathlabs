import type { Page } from "@playwright/test";

import { answerRound, expect, setNow, status, test } from "./helpers";

// Plays today's rounds in order from /play, pressing Next after each, so the last Next opens the
// day's score.
async function playDay(page: Page, picks: ("fake" | "truth")[]) {
  for (const [i, pick] of picks.entries()) {
    await expect(page.getByText(`Round ${i + 1}/5`)).toBeVisible();
    await answerRound(page, pick);
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
}

const dayDone = (page: Page) => page.getByRole("region", { name: "Today’s score" });

test("finishing a day at 5/5 shows the score, the points by reason and the countdown", async ({
  page,
}) => {
  await page.goto("/play");
  await playDay(page, ["fake", "fake", "fake", "fake", "fake"]);

  await expect(dayDone(page).getByText("5/5")).toBeVisible();
  await expect(dayDone(page).locator("dl > div")).toHaveText([
    "Correct rounds+50",
    "Perfect day+20",
    "Streak bonus+5",
    "Points earned+75",
  ]);
  // The clock is fixed at noon IST, so the next set is 12 hours away.
  await expect(dayDone(page)).toContainText(/New rounds in (12:00:00|11:59:\d\d)/);
});

test("completing a second day in a row raises the streak to 2 and the bonus to +10", async ({
  page,
}) => {
  await page.goto("/play");
  await playDay(page, ["fake", "fake", "fake", "fake", "fake"]);
  await expect(dayDone(page)).toBeVisible();

  await setNow(page, "2026-10-15T12:00:00+05:30");
  await page.goto("/");
  // Today is not finished yet, so yesterday's streak still stands.
  await expect(status(page, "day streak")).toHaveText("1");
  await page.getByRole("link", { name: "Play", exact: true }).click();
  await playDay(page, ["fake", "fake", "fake", "fake", "truth"]);

  await expect(dayDone(page).getByText("4/5")).toBeVisible();
  await expect(dayDone(page).locator("dl > div")).toHaveText([
    "Correct rounds+40",
    "Streak bonus+10",
    "Points earned+50",
  ]);
  await page.getByRole("link", { name: "Exit" }).click();
  await expect(status(page, "day streak")).toHaveText("2");
});
