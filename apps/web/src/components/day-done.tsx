import { cn } from "@kenpathlabs/ui/lib/utils";
import { useState } from "react";

import { useMountEffect } from "@/lib/use-mount-effect";
import type { RouterOutputs } from "@/utils/trpc";

import { Glitch } from "./glitch";
import { ResultPill } from "./round-card";

type Today = RouterOutputs["game"]["today"];
type Done = NonNullable<Today["done"]>;

// Indexed by the number of rounds right.
const VERDICTS = [
  "Fully hallucinated. Tomorrow is a new set.",
  "The fakes won today.",
  "The fakes had a good day.",
  "More truth than fiction.",
  "Sharp. One slipped past you.",
  "Perfect day. Nothing got past you.",
];

function formatLeft(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return [seconds / 3600, (seconds % 3600) / 60, seconds % 60]
    .map((n) => String(Math.floor(n)).padStart(2, "0"))
    .join(":");
}

// `deadline` is a device timestamp offset from the server's time, so it hits zero at the
// server's midnight whatever the device clock says, give or take the response latency.
// Keyed by `deadline`, so a refetch that brings a new one restarts the timer.
function Countdown({ deadline, onElapsed }: { deadline: number; onElapsed: () => void }) {
  const [now, setNow] = useState(Date.now);

  useMountEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= deadline) {
        clearInterval(id);
        onElapsed();
      }
    }, 1000);
    return () => clearInterval(id);
  });

  return <span className="font-mono tabular-nums">{formatLeft(Math.max(0, deadline - now))}</span>;
}

export function DayDone({
  done,
  rounds,
  streak,
  receivedAt,
  onNewDay,
}: {
  done: Done;
  rounds: Today["rounds"];
  streak: number;
  receivedAt: number;
  onNewDay: () => void;
}) {
  const bonuses = [
    { label: "Perfect day", points: done.points.perfect },
    {
      label: `Streak bonus · ${streak} ${streak === 1 ? "day" : "days"}`,
      points: done.points.streak,
    },
  ].filter((line) => line.points > 0);
  const sum = done.points.round + bonuses.reduce((s, line) => s + line.points, 0);
  const deadline = receivedAt + Date.parse(done.nextDayStart) - Date.parse(done.serverTime);

  return (
    <section
      aria-labelledby="day-done"
      className="flex flex-1 animate-in flex-col justify-center gap-8 py-4 duration-500 ease-out fade-in fill-mode-both slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 id="day-done" className="eyebrow">
          Today’s score
        </h2>
        <p className="font-mono text-7xl font-semibold tabular-nums">
          <Glitch>{String(done.correct)}</Glitch>
          <span className="text-muted-foreground/60">/{rounds.length}</span>
        </p>
        <p className="text-sm text-muted-foreground">{VERDICTS[done.correct]}</p>
      </div>
      {/* A receipt: each round, then the day's bonuses, then the total. */}
      <dl className="flex flex-col rounded-xl border text-sm">
        {rounds.map((round, i) => (
          <div
            key={round.id}
            style={{ animationDelay: `${130 + i * 45}ms` }}
            className="flex animate-in items-center gap-3 border-b px-4 py-3 duration-500 ease-out fade-in fill-mode-both slide-in-from-bottom-1 motion-reduce:animate-none"
          >
            <ResultPill correct={round.result?.correct} />
            <dt className="min-w-0 flex-1 truncate">{round.theme}</dt>
            <dd
              className={cn(
                "font-mono tabular-nums",
                !round.result?.points && "text-muted-foreground",
              )}
            >
              {round.result?.points ? `+${round.result.points}` : "0"}
            </dd>
          </div>
        ))}
        {bonuses.map(({ label, points }) => (
          <div key={label} className="flex justify-between gap-3 border-b px-4 py-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono tabular-nums">+{points}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 px-4 py-3 font-medium">
          <dt>Points earned</dt>
          <dd className="font-mono text-xl text-brand tabular-nums">+{sum}</dd>
        </div>
      </dl>
      <p className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
        New rounds in
        <span className="text-3xl font-medium text-foreground">
          <Countdown key={deadline} deadline={deadline} onElapsed={onNewDay} />
        </span>
      </p>
    </section>
  );
}
