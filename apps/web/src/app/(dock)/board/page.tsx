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
      ? (["Claim your account to get ranked.", "Sign up", "/me"] as const)
      : ([
          "No points this season yet. Play today’s rounds to get on the board.",
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
        <div
          className="flex animate-in flex-col gap-5 duration-500 ease-out fade-in fill-mode-both"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex flex-col gap-1">
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <BoardListSkeleton />
        </div>
      )}
      {board.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Could not load the board.
        </p>
      )}
      {board.isSuccess && (
        <>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Season {board.data.season}</h1>
            <p className="text-xs text-pretty text-muted-foreground tabular-nums">
              {formatTimeLeft(Date.parse(board.data.endsAt) - Date.parse(board.data.serverTime))}{" "}
              left · Top 10 keep their badge when the season ends
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
