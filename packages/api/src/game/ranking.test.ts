import { describe, expect, it } from "vitest";

import { type SeasonTotal, rankSeason } from "./ranking";

const at = (minute: number) => new Date(Date.UTC(2026, 9, 12, 0, minute));

function total(userId: string, points: number, minute = 0, isAnonymous = false): SeasonTotal {
  return { userId, points, reachedAt: at(minute), isAnonymous };
}

const ids = (totals: readonly SeasonTotal[]) => rankSeason(totals).map((row) => row.userId);

describe("rankSeason", () => {
  it("orders by points, highest first", () => {
    expect(ids([total("a", 10), total("b", 30), total("c", 20)])).toEqual(["b", "c", "a"]);
  });

  it("ranks more points above an earlier reachedAt", () => {
    expect(ids([total("a", 10, 0), total("b", 20, 5)])).toEqual(["b", "a"]);
  });

  it("breaks a points tie by who reached it first", () => {
    expect(ids([total("a", 10, 5), total("b", 10, 1)])).toEqual(["b", "a"]);
  });

  it("breaks a full tie by user id", () => {
    expect(ids([total("b", 10, 1), total("a", 10, 1)])).toEqual(["a", "b"]);
  });

  it("excludes anonymous players", () => {
    expect(ids([total("a", 10), total("anon", 50, 0, true)])).toEqual(["a"]);
  });

  it("ranks bots like anyone else", () => {
    const rows = rankSeason([
      { ...total("bot", 50), isBot: true },
      { ...total("a", 10), isBot: false },
    ]);
    expect(rows.map((row) => [row.userId, row.rank])).toEqual([
      ["bot", 1],
      ["a", 2],
    ]);
  });

  it("excludes players with no points", () => {
    expect(ids([total("a", 10), total("zero", 0)])).toEqual(["a"]);
  });

  it("gives goat to #1, 10x to #2 through #10 and nothing from #11", () => {
    const rows = rankSeason(Array.from({ length: 11 }, (_, i) => total(`u${i}`, 100 - i)));
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(rows[0]?.badge).toBe("goat");
    expect(rows[1]?.badge).toBe("10x");
    expect(rows[9]?.badge).toBe("10x");
    expect(rows[10]?.badge).toBeNull();
  });

  it("handles fewer than 10 players", () => {
    const rows = rankSeason([total("a", 3), total("b", 2), total("c", 1)]);
    expect(rows.map((row) => [row.rank, row.badge])).toEqual([
      [1, "goat"],
      [2, "10x"],
      [3, "10x"],
    ]);
  });

  it("passes extra fields through", () => {
    const [row] = rankSeason([{ ...total("a", 10), name: "Ada", username: "ada" }]);
    expect(row).toMatchObject({ name: "Ada", username: "ada", rank: 1, badge: "goat" });
  });
});
