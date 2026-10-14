import { buttonVariants } from "@kenpathlabs/ui/components/button";
import { Play } from "lucide-react";
import Link from "next/link";

import { Progress } from "./round-card";

// Today's way into /play. Answers are saved as they are made, so a started day resumes.
export function PlayCard({ results }: { results: (boolean | undefined)[] }) {
  const answered = results.filter((r) => r !== undefined).length;

  return (
    <section aria-labelledby="play" className="flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="play" className="text-sm font-medium">
            Today’s rounds
          </h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {answered
              ? `Round ${answered + 1} of ${results.length}`
              : `${results.length} rounds. Find the fake in each.`}
          </p>
        </div>
        <Progress results={results} />
      </div>
      <Link href="/play" className={buttonVariants({ size: "lg", className: "w-full" })}>
        <Play data-icon="inline-start" />
        {answered ? "Resume" : "Play"}
      </Link>
    </section>
  );
}
