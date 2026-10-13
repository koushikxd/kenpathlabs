import { describe, expect, it } from "vitest";

import { roundPositions, statementOrder } from "./schedule";

describe("roundPositions", () => {
  it("plays positions 1 to 5 on launch day", () => {
    expect(roundPositions("2026-10-12")).toEqual([1, 2, 3, 4, 5]);
  });

  it("plays positions 66 to 70 on day 13", () => {
    expect(roundPositions("2026-10-25")).toEqual([66, 67, 68, 69, 70]);
  });

  it("wraps to day 0 on day 14", () => {
    expect(roundPositions("2026-10-26")).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("statementOrder", () => {
  const statements = ["a", "b", "c"];

  it("returns a permutation", () => {
    const order = statementOrder(statements, "2026-10-13", "r1");
    expect(order).toHaveLength(3);
    expect([...order].sort()).toEqual(statements);
  });

  it("is stable for the same day and round", () => {
    expect(statementOrder(statements, "2026-10-13", "r1")).toEqual(
      statementOrder(statements, "2026-10-13", "r1"),
    );
  });

  it("depends on both the day and the round", () => {
    const distinct = (orders: string[][]) => new Set(orders.map((order) => order.join())).size;
    const days = Array.from({ length: 8 }, (_, i) => `2026-10-${13 + i}`);
    const rounds = Array.from({ length: 8 }, (_, i) => `r${i}`);
    expect(distinct(days.map((day) => statementOrder(statements, day, "r1")))).toBeGreaterThan(1);
    expect(
      distinct(rounds.map((round) => statementOrder(statements, "2026-10-13", round))),
    ).toBeGreaterThan(1);
  });

  it("does not mutate its input", () => {
    statementOrder(statements, "2026-10-13", "r1");
    expect(statements).toEqual(["a", "b", "c"]);
  });
});
