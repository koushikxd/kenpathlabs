import type { GraphCell } from "@kenpathlabs/api/game/history";

import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { cn } from "@kenpathlabs/ui/lib/utils";

// Index is the day's correct count, 0 to 5.
const SHADES = ["bg-muted", "bg-brand/20", "bg-brand/40", "bg-brand/60", "bg-brand/80", "bg-brand"];
const GRID = "grid grid-flow-col grid-cols-20 grid-rows-7 gap-[3px]";

function cellLabel(cell: GraphCell, isToday: boolean) {
  const date = new Date(`${cell.day}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const state = cell.frozen ? "frozen" : `${cell.correct} of 5 correct`;
  return `${isToday ? "Today, " : ""}${date}: ${state}`;
}

// Visual only: every cell already names its own state for screen readers.
function Legend() {
  return (
    <div aria-hidden className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        Less
        {SHADES.map((shade) => (
          <span key={shade} className={cn("size-2.5 rounded-xs", shade)} />
        ))}
        More
      </span>
      <span className="flex items-center gap-1">
        <span className="size-2.5 rounded-xs bg-frozen" />
        Frozen
      </span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <section aria-labelledby="graph-title" className="flex flex-col gap-3">
      <h2 id="graph-title" className="text-xs font-medium text-muted-foreground">
        Last 20 weeks
      </h2>
      {children}
    </section>
  );
}

export function ActivityGraph({ graph }: { graph: GraphCell[] }) {
  const played = graph.filter((cell) => cell.correct > 0).length;
  const frozen = graph.filter((cell) => cell.frozen).length;

  return (
    <Frame>
      {/* Columns are weeks, Monday on top: the first cell is always a Monday. */}
      <ol className={GRID}>
        {graph.map((cell, i) => {
          const isToday = i === graph.length - 1;
          const label = cellLabel(cell, isToday);
          return (
            <li
              key={cell.day}
              title={label}
              className={cn(
                "aspect-square rounded-xs",
                cell.frozen ? "bg-frozen" : SHADES[cell.correct],
                isToday && "outline-1 outline-offset-1 outline-foreground",
              )}
            >
              <span className="sr-only">{label}</span>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted-foreground tabular-nums">
        Played {played} of the last {graph.length} days · {frozen} frozen
      </p>
      <Legend />
    </Frame>
  );
}

export function ActivityGraphSkeleton() {
  return (
    <Frame>
      <ol aria-hidden className={cn(GRID, "animate-pulse motion-reduce:animate-none")}>
        {Array.from({ length: 140 }, (_, i) => (
          <li key={i} className="aspect-square rounded-xs bg-muted" />
        ))}
      </ol>
      <Skeleton className="h-4 w-48 rounded-md" />
      <Legend />
    </Frame>
  );
}
