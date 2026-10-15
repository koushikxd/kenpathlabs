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

test("a first visit shows skeletons, not a spinner, while it signs in", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/auth/sign-in/anonymous", async (route) => {
    await held;
    await route.continue();
  });
  const unauthorized: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/trpc") && response.status() === 401)
      unauthorized.push(response.url());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Last 20 weeks" })).toBeVisible();
  await expect(page.locator('[data-slot="skeleton"]').first()).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading" })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath("signing-in.png") });

  release();
  await expect(page.getByRole("link", { name: "Play", exact: true })).toBeVisible();
  expect(unauthorized).toEqual([]);
});
