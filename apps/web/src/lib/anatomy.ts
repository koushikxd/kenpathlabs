// Isometric figures in public/anatomy, built by tools/anatomy/build.mjs.
const FIGURES = [
  "01-token-press",
  "02-patch-bay",
  "03-ai-chip",
  "04-context-window",
  "05-card-catalog",
  "06-loss-plotter",
  "07-coin-sorter",
  "08-weight-set",
  "09-server-rack",
  "10-polygraph",
];

// The day's first round id seeds a starting figure and each round steps on from it, so the
// pick looks random across days, never repeats within a day, and survives a reload.
export function figureOf(firstRoundId: string, roundNumber: number) {
  let seed = 0;
  for (const char of firstRoundId) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  return `/anatomy/${FIGURES[(seed + roundNumber - 1) % FIGURES.length]}.svg`;
}
