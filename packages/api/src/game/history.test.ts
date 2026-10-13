import { describe, expect, it } from "vitest";

import { addDays } from "./clock";
import { type AttemptRecord, computeHistory } from "./history";

const MON = "2026-10-12";
const day = (n: number) => addDays(MON, n);

function played(on: string, correct = 5, answered = 5): AttemptRecord[] {
  return Array.from({ length: answered }, (_, i) => ({ day: on, correct: i < correct }));
}

function run(from: number, count: number, correct = 5): AttemptRecord[] {
  return Array.from({ length: count }, (_, i) => played(day(from + i), correct)).flat();
}

describe("streaks", () => {
  it("is all zero with no attempts", () => {
    const history = computeHistory([], MON);
    expect(history).toMatchObject({ currentStreak: 0, longestStreak: 0, freezes: 0, badges: [] });
    expect(history.graph.every((cell) => cell.correct === 0 && !cell.frozen)).toBe(true);
  });

  it("counts a finished first day", () => {
    expect(computeHistory(played(MON), MON)).toMatchObject({ currentStreak: 1, longestStreak: 1 });
  });

  it("keeps yesterday's streak current while today has no attempts", () => {
    expect(computeHistory(run(0, 3), day(3)).currentStreak).toBe(3);
  });

  it("treats a partial past day as missed", () => {
    const attempts = [...played(day(0)), ...played(day(1), 4, 4), ...played(day(2))];
    expect(computeHistory(attempts, day(2)).currentStreak).toBe(1);
  });

  it("earns a freeze at 7 and another at 14", () => {
    expect(computeHistory(run(0, 7), day(6)).freezes).toBe(1);
    expect(computeHistory(run(0, 14), day(13)).freezes).toBe(2);
  });

  it("holds at most 2 freezes", () => {
    expect(computeHistory(run(0, 21), day(20)).freezes).toBe(2);
  });

  it("uses a freeze on a missed day and keeps the streak", () => {
    const history = computeHistory(run(0, 7), day(8));
    expect(history).toMatchObject({ currentStreak: 7, freezes: 0 });
    expect(history.graph.find((cell) => cell.day === day(7))?.frozen).toBe(true);
  });

  it("does not add a frozen day to the streak", () => {
    expect(computeHistory([...run(0, 7), ...played(day(8))], day(8)).currentStreak).toBe(8);
  });

  it("resets on the second missed day when only one freeze is held", () => {
    expect(computeHistory(run(0, 7), day(9)).currentStreak).toBe(0);
  });

  it("spends both held freezes before resetting", () => {
    const history = computeHistory(run(0, 14), day(16));
    expect(history).toMatchObject({ currentStreak: 14, freezes: 0 });
    expect(history.graph.filter((cell) => cell.frozen).map((cell) => cell.day)).toEqual([
      day(14),
      day(15),
    ]);
    expect(computeHistory(run(0, 14), day(17)).currentStreak).toBe(0);
  });

  it("earns freezes again on a streak rebuilt after a reset", () => {
    const history = computeHistory([...run(0, 7), ...run(9, 7)], day(15));
    expect(history).toMatchObject({ currentStreak: 7, longestStreak: 7, freezes: 1 });
  });

  it("resets on a missed day without a freeze", () => {
    expect(computeHistory(run(0, 3), day(4)).currentStreak).toBe(0);
  });

  it("ignores an unfinished today", () => {
    expect(computeHistory([...run(0, 3), ...played(day(3), 2, 2)], day(3)).currentStreak).toBe(3);
  });

  it("counts a finished today", () => {
    expect(computeHistory(run(0, 4), day(3)).currentStreak).toBe(4);
  });

  it("tracks longest separately from current", () => {
    const history = computeHistory([...run(0, 5), ...run(6, 2)], day(7));
    expect(history).toMatchObject({ currentStreak: 2, longestStreak: 5 });
  });
});

describe("graph", () => {
  it("covers 20 weeks starting on a Monday and ending today", () => {
    const onMonday = computeHistory([], MON).graph;
    const onSunday = computeHistory([], day(6)).graph;
    expect(onMonday).toHaveLength(134);
    expect(onSunday).toHaveLength(140);
    expect(new Date(onSunday[0]!.day).getUTCDay()).toBe(1);
    expect(onSunday.at(-1)?.day).toBe(day(6));
  });

  it("shows correct rounds per day, including an unfinished today", () => {
    const graph = computeHistory([...played(day(0), 3), ...played(day(1), 2, 2)], day(1)).graph;
    expect(graph.at(-2)).toEqual({ day: day(0), correct: 3, frozen: false });
    expect(graph.at(-1)).toEqual({ day: day(1), correct: 2, frozen: false });
  });
});

describe("badges", () => {
  it("awards First Token on the first answer", () => {
    expect(computeHistory([], MON).badges).not.toContain("first-token");
    expect(computeHistory([{ day: MON, correct: false }], MON).badges).toContain("first-token");
  });

  it("awards On Fire at a 7-day streak", () => {
    expect(computeHistory(run(0, 6, 4), day(5)).badges).not.toContain("on-fire");
    expect(computeHistory(run(0, 7, 4), day(6)).badges).toContain("on-fire");
  });

  it("awards Perfect Week at 7 days in a row at 5/5", () => {
    expect(computeHistory([...run(0, 6), ...played(day(6), 4)], day(6)).badges).not.toContain(
      "perfect-week",
    );
    expect(computeHistory(run(0, 7), day(6)).badges).toContain("perfect-week");
  });

  it("does not let a frozen day join two perfect runs", () => {
    const attempts = [...run(0, 4, 4), ...run(4, 3), ...run(8, 4)];
    const history = computeHistory(attempts, day(11));
    expect(history.currentStreak).toBe(11);
    expect(history.badges).not.toContain("perfect-week");
  });

  it("awards Hallucination Hunter at 50 correct", () => {
    expect(computeHistory([...run(0, 9), ...played(day(9), 4)], day(9)).badges).not.toContain(
      "hallucination-hunter",
    );
    expect(computeHistory(run(0, 10), day(9)).badges).toContain("hallucination-hunter");
  });

  it("keeps badges after the streak is lost", () => {
    const history = computeHistory(run(0, 7), day(9));
    expect(history.currentStreak).toBe(0);
    expect(history.badges).toEqual(["first-token", "on-fire", "perfect-week"]);
  });
});
