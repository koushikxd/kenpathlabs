import type { RouterOutputs } from "@/utils/trpc";

type Entry = RouterOutputs["me"]["get"]["ledger"][number];

const REASONS = new Map([
  ["round", "Correct answer"],
  ["perfect", "Perfect day"],
  ["streak", "Streak bonus"],
  ["seed", "Starting points"],
]);

// IST, because the game day is IST and `createdAt` is when the server took the answer.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
}

export function PointsLedger({ ledger }: { ledger: Entry[] }) {
  return (
    <section aria-labelledby="ledger-title" className="flex flex-col gap-3">
      <h2 id="ledger-title" className="text-xs font-medium text-muted-foreground">
        Recent points
      </h2>
      {ledger.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {ledger.map((entry) => (
            // (reason, ref) is unique per player.
            <li key={`${entry.reason}:${entry.ref}`} className="flex items-center gap-3 px-3 py-3">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">
                  {REASONS.get(entry.reason) ?? entry.reason}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(entry.createdAt)}
                </span>
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums">+{entry.amount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-border px-3 py-3 text-xs text-pretty text-muted-foreground">
          No points yet. Answer today’s rounds to earn your first.
        </p>
      )}
    </section>
  );
}
