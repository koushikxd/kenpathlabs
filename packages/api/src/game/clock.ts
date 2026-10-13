const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
// IST is a fixed +05:30 with no DST, so plain offset arithmetic is exact.
const IST_OFFSET = (5 * 60 + 30) * 60 * 1000;

export const LAUNCH = new Date("2026-10-11T18:30:00Z"); // Monday 2026-10-12 00:00 IST
export const LAUNCH_DAY = "2026-10-12";

export function dayKey(now: Date): string {
  return new Date(now.getTime() + IST_OFFSET).toISOString().slice(0, 10);
}

export function nextDayStart(now: Date): Date {
  return new Date(Date.parse(addDays(dayKey(now), 1)) - IST_OFFSET);
}

export function addDays(day: string, n: number): string {
  return new Date(Date.parse(day) + n * DAY).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / DAY;
}

export function seasonNumber(now: Date): number {
  return Math.floor((now.getTime() - LAUNCH.getTime()) / WEEK) + 1;
}

export function seasonWindow(n: number) {
  const start = LAUNCH.getTime() + (n - 1) * WEEK;
  return { start: new Date(start), end: new Date(start + WEEK) };
}
