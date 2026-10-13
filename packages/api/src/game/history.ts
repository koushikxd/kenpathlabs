import { addDays, daysBetween } from "./clock";
import { ROUNDS_PER_DAY } from "./schedule";

export type AttemptRecord = { day: string; correct: boolean };
export type GraphCell = { day: string; correct: number; frozen: boolean };
export type Badge = "first-token" | "on-fire" | "perfect-week" | "hallucination-hunter";
export type History = {
  currentStreak: number;
  longestStreak: number;
  freezes: number;
  graph: GraphCell[];
  badges: Badge[];
};

const WEEK_DAYS = 7;
const MAX_FREEZES = 2;
const GRAPH_WEEKS = 20;
const HUNTER_CORRECT = 50;

export function computeHistory(attempts: readonly AttemptRecord[], today: string): History {
  const days = new Map<string, { answered: number; correct: number }>();
  let totalCorrect = 0;
  for (const attempt of attempts) {
    const counts = days.get(attempt.day) ?? { answered: 0, correct: 0 };
    counts.answered++;
    if (attempt.correct) {
      counts.correct++;
      totalCorrect++;
    }
    days.set(attempt.day, counts);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let freezes = 0;
  let perfectRun = 0;
  let perfectWeek = false;
  const frozen = new Set<string>();
  const firstDay = [...days.keys()].sort()[0];

  // Day keys are YYYY-MM-DD, so string order is date order.
  for (let day = firstDay; day !== undefined && day <= today; day = addDays(day, 1)) {
    const counts = days.get(day) ?? { answered: 0, correct: 0 };
    const finished = counts.answered >= ROUNDS_PER_DAY;
    if (day === today && !finished) break;

    if (finished) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
      if (currentStreak % WEEK_DAYS === 0 && freezes < MAX_FREEZES) freezes++;
      perfectRun = counts.correct === ROUNDS_PER_DAY ? perfectRun + 1 : 0;
      if (perfectRun >= WEEK_DAYS) perfectWeek = true;
    } else {
      if (freezes > 0) {
        freezes--;
        frozen.add(day);
      } else {
        currentStreak = 0;
      }
      perfectRun = 0;
    }
  }

  const daysSinceMonday = (new Date(today).getUTCDay() + 6) % 7;
  const graphStart = addDays(today, -daysSinceMonday - WEEK_DAYS * (GRAPH_WEEKS - 1));
  const graph = Array.from({ length: daysBetween(graphStart, today) + 1 }, (_, i) => {
    const day = addDays(graphStart, i);
    return { day, correct: days.get(day)?.correct ?? 0, frozen: frozen.has(day) };
  });

  const badges: Badge[] = [];
  if (attempts.length > 0) badges.push("first-token");
  if (longestStreak >= WEEK_DAYS) badges.push("on-fire");
  if (perfectWeek) badges.push("perfect-week");
  if (totalCorrect >= HUNTER_CORRECT) badges.push("hallucination-hunter");

  return { currentStreak, longestStreak, freezes, graph, badges };
}
