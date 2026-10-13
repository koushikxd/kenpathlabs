"use client";

import { useQuery } from "@tanstack/react-query";

import { ActivityGraph, ActivityGraphSkeleton } from "@/components/activity-graph";
import { TodayStatus, TodayStatusSkeleton } from "@/components/today-status";
import { trpc } from "@/utils/trpc";

export default function TodayPage() {
  const today = useQuery(trpc.game.today.queryOptions());

  return (
    <>
      <h1 className="sr-only">Today</h1>
      {today.isPending && (
        <div
          className="flex animate-in flex-col gap-5 duration-500 ease-out fade-in fill-mode-both"
          style={{ animationDelay: "500ms" }}
        >
          <TodayStatusSkeleton />
          <ActivityGraphSkeleton />
        </div>
      )}
      {today.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Could not load today.
        </p>
      )}
      {today.isSuccess && (
        <>
          <TodayStatus
            streak={today.data.streak}
            freezes={today.data.freezes}
            season={today.data.season}
          />
          <ActivityGraph graph={today.data.graph} />
          {/* #17: the current round, or the day's result, goes here. */}
        </>
      )}
    </>
  );
}
