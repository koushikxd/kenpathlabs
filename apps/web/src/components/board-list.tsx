import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { cn } from "@kenpathlabs/ui/lib/utils";
import Link from "next/link";

import type { RouterOutputs } from "@/utils/trpc";

import { BotTag, RankBadge } from "./player-tags";

type Row = RouterOutputs["board"]["season"]["rows"][number];

const LIST = "divide-y divide-border overflow-hidden rounded-xl border border-border";
const ROW = "flex items-center gap-3 px-3 py-3";

function RowContent({ row }: { row: Row }) {
  return (
    <>
      <span className="w-6 text-right font-mono text-xs text-muted-foreground tabular-nums">
        {row.rank}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate text-sm font-medium">{row.name}</span>
          {row.isBot && <BotTag />}
          <RankBadge badge={row.badge} />
        </span>
        {row.username && (
          <span className="truncate text-xs text-muted-foreground">@{row.username}</span>
        )}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums">{row.points}</span>
    </>
  );
}

// A row without a username (an account made outside our sign-up form) has no profile to link to.
export function BoardRow({ row, isMe = false }: { row: Row; isMe?: boolean }) {
  const className = cn(ROW, isMe && "bg-brand/5");
  if (!row.username) {
    return (
      <div aria-current={isMe || undefined} className={className}>
        <RowContent row={row} />
      </div>
    );
  }
  return (
    <Link
      href={`/u/${row.username}`}
      aria-current={isMe || undefined}
      className={cn(
        className,
        "transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
      )}
    >
      <RowContent row={row} />
    </Link>
  );
}

export function BoardList({ rows, myRank }: { rows: Row[]; myRank?: number }) {
  return (
    <ol className={LIST}>
      {rows.map((row) => (
        <li key={row.rank}>
          <BoardRow row={row} isMe={row.rank === myRank} />
        </li>
      ))}
    </ol>
  );
}

export function BoardListSkeleton() {
  return (
    <ol aria-hidden className={LIST}>
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className={ROW}>
          <Skeleton className="h-4 w-6 rounded-md" />
          <span className="flex flex-1 flex-col gap-0.5">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </span>
          <Skeleton className="h-5 w-10 rounded-md" />
        </li>
      ))}
    </ol>
  );
}
