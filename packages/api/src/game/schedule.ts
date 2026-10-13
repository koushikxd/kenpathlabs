import { LAUNCH_DAY, daysBetween } from "./clock";

export const ROUNDS_PER_DAY = 5;
export const POOL_DAYS = 14;

export function roundPositions(day: string): number[] {
  const index = ((daysBetween(LAUNCH_DAY, day) % POOL_DAYS) + POOL_DAYS) % POOL_DAYS;
  return Array.from({ length: ROUNDS_PER_DAY }, (_, k) => index * ROUNDS_PER_DAY + k + 1);
}

// Same order for every player on a given day; a looped round may get a new order on its next pass.
export function statementOrder<T>(statements: readonly T[], day: string, roundId: string): T[] {
  const random = mulberry32(fnv1a(`${day}:${roundId}`));
  return statements
    .map((statement) => ({ statement, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ statement }) => statement);
}

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
