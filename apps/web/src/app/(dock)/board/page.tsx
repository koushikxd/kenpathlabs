"use client";

import { buttonVariants } from "@kenpathlabs/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@kenpathlabs/ui/components/empty";
import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import Link from "next/link";

import { BoardList, BoardListSkeleton, BoardRow } from "@/components/board-list";
import { LoadError } from "@/components/load-error";
import { type RouterOutputs, trpc } from "@/utils/trpc";

type Board = RouterOutputs["board"]["season"];

// Two units at most, floored: "2d 5h", "5h 12m", "12m".
function formatTimeLeft(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "under a minute";
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Last child of the dock layout's <main>, so at the end of the scroll it rests above main's
// bottom padding and never covers the last row. Until then it sticks just above the dock.
function Pinned({ board }: { board: Board }) {
  let content: React.ReactNode;
  if (board.me) {
    content = <BoardRow row={board.me} isMe />;
  } else {
    const [text, label, href] = board.isAnonymous
      ? (["Sign up to appear on the board.", "Sign up", "/me"] as const)
      : ([
          "No points this season yet. Play today’s rounds to appear on the board.",
          "Play",
          "/",
        ] as const);
    content = (
      <div className="flex items-center gap-3 px-3 py-3">
        <p className="flex-1 text-xs text-pretty text-muted-foreground">{text}</p>
        <Link href={href} className={buttonVariants({ size: "sm" })}>
          {label}
        </Link>
      </div>
    );
  }
  return (
    <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] overflow-hidden rounded-xl bg-popover ring-1 ring-foreground/10">
      {content}
    </div>
  );
}

export default function BoardPage() {
  const board = useQuery(trpc.board.season.queryOptions());

  return (
    <>
      {board.isPending && (
        <>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <BoardListSkeleton />
        </>
      )}
      {board.isError && <LoadError>Could not load the board.</LoadError>}
      {board.isSuccess && (
        <>
          <div className="flex flex-col gap-1">
            <h1 className="eyebrow">Season {board.data.season}</h1>
            <p className="font-mono text-3xl font-semibold tabular-nums">
              {formatTimeLeft(Date.parse(board.data.endsAt) - Date.parse(board.data.serverTime))}
              <span className="text-base text-muted-foreground"> left</span>
            </p>
            <p className="text-xs text-pretty text-muted-foreground">
              Top 10 keep their badge when the season ends.
            </p>
          </div>
          {board.data.rows.length > 0 ? (
            <BoardList rows={board.data.rows} myRank={board.data.me?.rank} />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-11 rounded-2xl [&_svg]:size-5">
                  <Trophy />
                </EmptyMedia>
                <EmptyTitle>No ranked players yet</EmptyTitle>
                <EmptyDescription>Play today’s rounds to be first on the board.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <Pinned board={board.data} />
        </>
      )}
    </>
  );
}
