"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ActivityGraph, ActivityGraphSkeleton } from "@/components/activity-graph";
import { DayDone } from "@/components/day-done";
import { RoundCard } from "@/components/round-card";
import { TodayStatus, TodayStatusSkeleton } from "@/components/today-status";
import { trpc } from "@/utils/trpc";

export default function TodayPage() {
  const today = useQuery(trpc.game.today.queryOptions());
  // The round whose reveal is on screen. Without it, play resumes at the first unanswered round.
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const rounds = today.data?.rounds ?? [];
  const round =
    rounds.find((r) => r.id === revealedId && r.result) ?? rounds.find((r) => !r.result);

  return (
    <>
      <h1 className="sr-only">Today</h1>
      {today.isPending && (
        <>
          <TodayStatusSkeleton />
          <ActivityGraphSkeleton />
        </>
      )}
      {today.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Could not load today’s rounds.
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
          {round ? (
            <RoundCard
              key={round.id}
              round={round}
              total={rounds.length}
              onNext={() => setRevealedId(null)}
              onAnswered={() => setRevealedId(round.id)}
            />
          ) : (
            today.data.done && (
              <DayDone
                done={today.data.done}
                total={rounds.length}
                receivedAt={today.dataUpdatedAt}
                onNewDay={today.refetch}
              />
            )
          )}
        </>
      )}
    </>
  );
}
