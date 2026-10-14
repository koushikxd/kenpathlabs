import { expect, test } from "./helpers";

test("a fresh visit lands on Today with round 1/5, no sign-up", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("img", { name: "0 correct, 0 wrong, 5 to play" })).toBeVisible();
  await page.getByRole("link", { name: "Play", exact: true }).click();
  await expect(page.getByText("Round 1/5")).toBeVisible();
  await expect(page.getByRole("list").getByRole("button")).toHaveCount(3);

  // The visit signed in on its own, as an anonymous player.
  const session: { user: { isAnonymous: boolean } } = await (
    await page.request.get("/api/auth/get-session")
  ).json();
  expect(session.user.isAnonymous).toBe(true);
});
