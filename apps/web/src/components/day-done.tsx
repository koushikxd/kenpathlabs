import { useEffect, useState } from "react";

import type { RouterOutputs } from "@/utils/trpc";

type Done = NonNullable<RouterOutputs["game"]["today"]["done"]>;

function formatLeft(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return [seconds / 3600, (seconds % 3600) / 60, seconds % 60]
    .map((n) => String(Math.floor(n)).padStart(2, "0"))
    .join(":");
}

// `deadline` is a device timestamp offset from the server's time, so it hits zero at the
// server's midnight whatever the device clock says, give or take the response latency.
function Countdown({ deadline, onElapsed }: { deadline: number; onElapsed: () => void }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= deadline) {
        clearInterval(id);
        onElapsed();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, onElapsed]);

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
    <section aria-labelledby="day-done" className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-col items-center gap-1">
        <h2 id="day-done" className="text-xs font-medium text-muted-foreground">
          Today’s score
        </h2>
        <p className="font-mono text-2xl font-semibold tabular-nums">
          {done.correct}/{total}
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
        Next set in <Countdown deadline={deadline} onElapsed={onNewDay} />
      </p>
    </section>
  );
}
