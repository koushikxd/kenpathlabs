"use client";

import { buttonVariants } from "@kenpathlabs/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";

import { DayDone } from "@/components/day-done";
import { LoadError } from "@/components/load-error";
import Loader from "@/components/loader";
import { RoundCard } from "@/components/round-card";
import { figureOf } from "@/lib/anatomy";
import { trpc } from "@/utils/trpc";

// Every answer is saved as it is made, so Exit needs no save step: Today offers Resume, and
// play picks up at the first unanswered round.
export default function PlayPage() {
  const today = useQuery(trpc.game.today.queryOptions());
  // The round whose reveal is on screen. Without it, play resumes at the first unanswered round.
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const rounds = today.data?.rounds ?? [];
  const round =
    rounds.find((r) => r.id === revealedId && r.result) ?? rounds.find((r) => !r.result);

  return (
    <div className="flex animate-in flex-col gap-5 duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] fade-in fill-mode-both zoom-in-95 slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="sr-only">Play</h1>
      <Link
        href="/"
        replace
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "-ml-2.5 self-start",
        })}
      >
        <X data-icon="inline-start" />
        Exit
      </Link>
      {today.isPending && <Loader />}
      {today.isError && <LoadError>Could not load today’s rounds.</LoadError>}
      {today.isSuccess &&
        (round ? (
          // Keyed so the figure fades in and the round card's statements cascade, once per round.
          <Fragment key={round.id}>
            {/* Decorative: the figure sets the mood, the statements carry the round. */}
            <img
              src={figureOf(rounds[0].id, round.number)}
              alt=""
              width={360}
              height={200}
              className="h-auto w-full animate-in duration-500 ease-out fade-in fill-mode-both motion-reduce:animate-none"
            />
            <RoundCard
              round={round}
              results={rounds.map((r) => r.result?.correct)}
              onNext={() => setRevealedId(null)}
              onAnswered={() => setRevealedId(round.id)}
            />
          </Fragment>
        ) : (
          today.data.done && (
            <DayDone
              done={today.data.done}
              total={rounds.length}
              receivedAt={today.dataUpdatedAt}
              onNewDay={today.refetch}
            />
          )
        ))}
    </div>
  );
}
