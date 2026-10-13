import { describe, expect, it } from "vitest";

import {
  LAUNCH,
  LAUNCH_DAY,
  addDays,
  dayKey,
  daysBetween,
  nextDayStart,
  seasonNumber,
  seasonWindow,
} from "./clock";

const WEEK = 7 * 24 * 60 * 60 * 1000;

describe("dayKey", () => {
  it("rolls over at midnight IST", () => {
    expect(dayKey(new Date("2026-10-13T18:29:59Z"))).toBe("2026-10-13");
    expect(dayKey(new Date("2026-10-13T18:30:00Z"))).toBe("2026-10-14");
  });

  it("puts launch on the launch day", () => {
    expect(dayKey(LAUNCH)).toBe(LAUNCH_DAY);
  });
});

describe("nextDayStart", () => {
  it("is the next midnight IST", () => {
    expect(nextDayStart(new Date("2026-10-13T10:00:00Z"))).toEqual(
      new Date("2026-10-13T18:30:00Z"),
    );
  });

  it("moves a full day forward at exactly midnight IST", () => {
    expect(nextDayStart(new Date("2026-10-13T18:30:00Z"))).toEqual(
      new Date("2026-10-14T18:30:00Z"),
    );
  });
});

describe("day arithmetic", () => {
  it("adds days across a month end", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("subtracts days", () => {
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("counts days between", () => {
    expect(daysBetween("2026-10-12", "2026-10-26")).toBe(14);
    expect(daysBetween("2026-10-26", "2026-10-12")).toBe(-14);
    expect(daysBetween("2026-10-12", "2026-10-12")).toBe(0);
  });
});

describe("seasons", () => {
  it("starts season 1 at launch", () => {
    expect(seasonNumber(LAUNCH)).toBe(1);
  });

  it("changes season at Monday 00:00 IST", () => {
    expect(seasonNumber(new Date(LAUNCH.getTime() + WEEK - 1))).toBe(1);
    expect(seasonNumber(new Date(LAUNCH.getTime() + WEEK))).toBe(2);
  });

  it("gives a half-open window per season", () => {
    expect(seasonWindow(2)).toEqual({
      start: new Date(LAUNCH.getTime() + WEEK),
      end: new Date(LAUNCH.getTime() + 2 * WEEK),
    });
  });
});
