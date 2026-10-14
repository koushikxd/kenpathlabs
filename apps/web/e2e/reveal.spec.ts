import { answerRound, currentRound, expect, test } from "./helpers";

test("after a tap the fake shows its correction and the truths show source links", async ({
  page,
}) => {
  await page.goto("/play");
  const { fake, truths } = await currentRound(page);

  await answerRound(page, "truth");

  // The content validator requires a correction on every fake.
  await expect(page.getByText(fake.correction!)).toBeVisible();
  await expect(page.getByText("Hallucination", { exact: true })).toBeVisible();
  const sources = page.getByRole("link", { name: "Source" });
  await expect(sources).toHaveCount(2);
  for (const truth of truths) {
    await expect(sources.and(page.locator(`[href="${truth.sourceUrl}"]`))).toHaveCount(1);
  }
});
