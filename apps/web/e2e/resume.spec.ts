import { answerRound, expect, test } from "./helpers";

test("answer 2 rounds, reload, land on round 3", async ({ page }) => {
  await page.goto("/play");
  await answerRound(page, "fake");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Round 2/5")).toBeVisible();
  await answerRound(page, "truth");

  await page.reload();

  await expect(page.getByText("Round 3/5")).toBeVisible();
  await expect(page.getByRole("img", { name: "1 correct, 1 wrong, 3 to play" })).toBeVisible();
});
