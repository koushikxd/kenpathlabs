import { useState } from "react";

import { useMountEffect } from "@/lib/use-mount-effect";
import type { RouterOutputs } from "@/utils/trpc";

import { Glitch } from "./glitch";

type Done = NonNullable<RouterOutputs["game"]["today"]["done"]>;

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
  total,
  receivedAt,
  onNewDay,
}: {
  done: Done;
  total: number;
  receivedAt: number;
  onNewDay: () => void;
}) {
  const lines = [
    { label: "Correct rounds", points: done.points.round },
    { label: "Perfect day", points: done.points.perfect },
    { label: "Streak bonus", points: done.points.streak },
  ].filter((line) => line.points > 0);
  const sum = lines.reduce((s, line) => s + line.points, 0);
  const deadline = receivedAt + Date.parse(done.nextDayStart) - Date.parse(done.serverTime);

  return (
    <section
      aria-labelledby="day-done"
      className="flex animate-in flex-col gap-4 rounded-xl border p-4 duration-500 ease-out fade-in fill-mode-both slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      <div className="flex flex-col items-center gap-1">
        <h2 id="day-done" className="text-xs font-medium text-muted-foreground">
          Today’s score
        </h2>
        <p className="font-mono text-2xl font-semibold tabular-nums">
          <Glitch>{`${done.correct}/${total}`}</Glitch>
        </p>
      </div>
      <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
        {lines.map(({ label, points }) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono tabular-nums">+{points}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 font-medium">
          <dt>Points earned</dt>
          <dd className="font-mono text-brand tabular-nums">+{sum}</dd>
        </div>
      </dl>
      <p className="border-t pt-4 text-center text-xs text-muted-foreground">
        New rounds in <Countdown key={deadline} deadline={deadline} onElapsed={onNewDay} />
      </p>
    </section>
  );
}
