import type { Request } from "@playwright/test";

import { currentRound, db, expect, sessionUser, test } from "./helpers";

test("a double tap and a repeated request give one attempt and one set of points", async ({
  page,
}) => {
  await page.goto("/play");
  const { fake } = await currentRound(page);
  const sent: Request[] = [];
  page.on("request", (request) => {
    if (request.url().includes("game.answer")) sent.push(request);
  });

  await page.getByRole("button", { name: fake.text }).dblclick();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();

  // The same request again, as a client retrying after a lost response sends it.
  const replay = await page.request.fetch(sent[0]);
  expect(replay.ok()).toBe(true);
  expect(await replay.json()).toEqual(await (await sent[0].response())!.json());

  const player = (await sessionUser(page)).id;
  expect(await db.attempt.count({ where: { userId: player } })).toBe(1);
  expect(
    await db.pointEntry.findMany({
      where: { userId: player },
      select: { reason: true, amount: true },
    }),
  ).toEqual([{ reason: "round", amount: 10 }]);

  await page.reload();
  await expect(page.getByText("Round 2/5")).toBeVisible();
  await expect(page.getByRole("img", { name: "1 correct, 0 wrong, 4 to play" })).toBeVisible();
});
