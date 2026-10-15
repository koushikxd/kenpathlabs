"use client";

import { useQuery } from "@tanstack/react-query";

import { ActivityGraph, ActivityGraphSkeleton } from "@/components/activity-graph";
import { DayDone } from "@/components/day-done";
import { LoadError } from "@/components/load-error";
import { PlayCard, PlayCardSkeleton } from "@/components/play-card";
import { TodayStatus, TodayStatusSkeleton } from "@/components/today-status";
import { trpc } from "@/utils/trpc";

export default function TodayPage() {
  const today = useQuery(trpc.game.today.queryOptions());

  return (
    <>
      <h1 className="sr-only">Today</h1>
      {today.isPending && (
        <>
          <TodayStatusSkeleton />
          <ActivityGraphSkeleton />
          <PlayCardSkeleton />
        </>
      )}
      {today.isError && <LoadError>Could not load today’s rounds.</LoadError>}
      {today.isSuccess && (
        <>
          <TodayStatus
            streak={today.data.streak}
            freezes={today.data.freezes}
            season={today.data.season}
          />
          <ActivityGraph graph={today.data.graph} />
          {today.data.done ? (
            <DayDone
              done={today.data.done}
              rounds={today.data.rounds}
              streak={today.data.streak}
              receivedAt={today.dataUpdatedAt}
              onNewDay={today.refetch}
            />
          ) : (
            <PlayCard results={today.data.rounds.map((r) => r.result?.correct)} />
          )}
        </>
      )}
    </>
  );
}
