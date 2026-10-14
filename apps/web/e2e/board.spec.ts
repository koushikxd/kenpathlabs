import { type Page } from "@playwright/test";

import { answerRound, db, expect, setNow, signUp, test } from "./helpers";

// The caller's row in the board list, and the same row pinned below it. The dock's current link
// is aria-current="page", not "true".
const myListRow = (page: Page) => page.getByRole("listitem").locator('[aria-current="true"]');
const myPinnedRow = (page: Page) => page.locator(':not(li) > [aria-current="true"]');

test("an anonymous player with points sees the claim prompt, not a row", async ({ page }) => {
  await page.goto("/play");
  await answerRound(page, "fake");

  await page.goto("/board");

  await expect(page.getByText("Sign up to appear on the board.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up", exact: true })).toHaveAttribute(
    "href",
    "/me",
  );
  await expect(page.locator('[aria-current="true"]')).toHaveCount(0);
});

test("a signed-in player with points is ranked among the bots, own row pinned", async ({
  page,
}) => {
  const user = await signUp(page);
  await page.goto("/play");
  await answerRound(page, "fake");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await answerRound(page, "fake");

  await page.goto("/board");

  await expect(page.getByRole("heading", { name: "Season 1" })).toBeVisible();
  const pinned = myPinnedRow(page);
  await expect(pinned).toContainText(user.name);
  // A row's last span is its points.
  await expect(pinned.locator("span").last()).toHaveText("20");
  // The list holds the same row: rank, name, username and points.
  await expect(myListRow(page)).toHaveText((await pinned.textContent()) ?? "");

  // 20 points sits between the bots on 30 (Mei Lin) and 15 (Jonas Berg), whoever else has played.
  const rows = await page.getByRole("listitem").allTextContents();
  const at = (name: string) => rows.findIndex((row) => row.includes(name));
  expect(at("Mei Lin")).toBeLessThan(at(user.name));
  expect(at(user.name)).toBeLessThan(at("Jonas Berg"));

  // Every seeded bot is on the board with its tag.
  await expect(page.getByRole("listitem").getByText("bot", { exact: true })).toHaveCount(20);
});

// Season 2 (Mon 19 to Mon 26 Oct IST) is this test's own: other tests stay in season 1, where the
// standings keep changing while they run. It inserts season 2's points directly.
const IN_SEASON_2 = "2026-10-21T12:00:00+05:30";
// Season 3 starts Mon 26 Oct 00:00 IST. Finalization waits a minute past that.
const IN_SEASON_3 = "2026-10-26T00:02:00+05:30";

test("past Monday 00:00 IST the top 10 keep their award and the board starts fresh", async ({
  page,
}) => {
  await setNow(page, IN_SEASON_2);
  const user = await signUp(page);
  const { id } = await db.user.findUniqueOrThrow({ where: { username: user.username } });

  // The bots score their season 1 amounts again (Priya 420 at the top, Lena 185 10th, Arjun 170
  // 11th), and the player takes first with 500.
  const seeds = await db.pointEntry.findMany({ where: { reason: "seed", ref: "1" } });
  await db.pointEntry.createMany({
    data: [...seeds, { userId: id, amount: 500 }].map(({ userId, amount }) => ({
      userId,
      amount,
      reason: "seed",
      ref: "2",
      createdAt: new Date(IN_SEASON_2),
    })),
  });

  await page.goto("/board");
  await expect(page.getByRole("heading", { name: "Season 2" })).toBeVisible();
  await expect(myPinnedRow(page)).toContainText("da goat");

  await setNow(page, IN_SEASON_3);
  await page.reload();

  await expect(page.getByRole("heading", { name: "Season 3" })).toBeVisible();
  await expect(page.getByText("No ranked players yet")).toBeVisible();
  await expect(page.getByText("No points this season yet.")).toBeVisible();

  const awards = page.getByRole("region", { name: "Season awards" });
  const expected = [
    ["priya.ships", "Season 2 · 10x dev"],
    ["lena.lambda", "Season 2 · 10x dev"],
    [user.username, "Season 2 · da goat"],
  ];
  await page.goto("/u/arjun_gradient");
  await expect(awards).toBeVisible();
  await expect(awards).not.toContainText("Season 2");
  for (const [username, award] of expected) {
    await page.goto(`/u/${username}`);
    await expect(awards).toContainText(award);
  }
  await awards.scrollIntoViewIfNeeded();
});
