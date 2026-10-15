import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { Play } from "lucide-react";
import Link from "next/link";

import { Progress, ProgressSkeleton } from "./round-card";

const ORB =
  "grid place-items-center rounded-full bg-brand bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(0_0_0/0.08)_3px_4px)] text-background";
const ICON = "size-14 translate-x-1 fill-current";
const HERO = "flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center";

// Today's way into /play. Answers are saved as they are made, so a started day resumes.
// It fills the space left above the dock and centres the button in it.
export function PlayCard({ results }: { results: (boolean | undefined)[] }) {
  const answered = results.filter((r) => r !== undefined).length;
  const label = answered ? "Resume" : "Play";

  return (
    <section aria-labelledby="play" className={HERO}>
      <h2 id="play" className="sr-only">
        Today’s rounds
      </h2>
      <Link
        href="/play"
        className="group flex flex-col items-center gap-5 rounded-3xl p-2 outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span
          aria-hidden
          className="glitch-orb size-36 rounded-full shadow-[0_0_56px_-12px_var(--brand)] ring-8 ring-brand/15 transition-[scale] duration-150 ease-out group-hover:scale-[1.04] group-active:scale-[0.96] motion-reduce:transition-none"
        >
          <span className={`size-full ${ORB}`}>
            <Play className={ICON} />
          </span>
          <span className={`glitch-slice absolute inset-0 [clip-path:inset(58%_0_28%_0)] ${ORB}`}>
            <Play className={ICON} />
          </span>
        </span>
        <span
          data-text={label}
          className="glitch glitch-loop font-mono text-2xl font-semibold -mr-[0.3em] tracking-[0.3em] uppercase"
        >
          {label}
        </span>
      </Link>
      <p className="text-sm text-muted-foreground tabular-nums">
        {answered
          ? `Round ${answered + 1} of ${results.length}`
          : `${results.length} rounds. Find the fake in each.`}
      </p>
      <Progress results={results} />
    </section>
  );
}

export function PlayCardSkeleton() {
  return (
    <div aria-hidden className={HERO}>
      <div className="flex flex-col items-center gap-5 p-2">
        <Skeleton className="size-36 rounded-full ring-8 ring-muted/40" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-5 w-56" />
      <ProgressSkeleton />
    </div>
  );
}
