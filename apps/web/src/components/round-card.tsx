import { ROUNDS_PER_DAY } from "@kenpathlabs/api/game/schedule";
import { Button } from "@kenpathlabs/ui/components/button";
import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { Spinner } from "@kenpathlabs/ui/components/spinner";
import { cn } from "@kenpathlabs/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, ExternalLink, X } from "lucide-react";

import { useFeedback } from "@/lib/feedback";
import { queryClient, trpc, type RouterOutputs } from "@/utils/trpc";

import { Glitch } from "./glitch";

type Round = RouterOutputs["game"]["today"]["rounds"][number];
type Statement = Round["statements"][number];
type Result = NonNullable<Round["result"]>;

const STATEMENT = "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-base";
const LABEL =
  "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium";

function RevealedStatement({ statement, result }: { statement: Statement; result: Result }) {
  const isFake = statement.id === result.fakeId;
  const isPick = statement.id === result.pickedId;
  const source = result.sources.find((s) => s.statementId === statement.id)?.url;

  return (
    <div
      className={cn(
        STATEMENT,
        "relative",
        isFake
          ? "border-destructive/40 bg-destructive/5"
          : isPick
            ? "border-foreground/30"
            : "border-border",
      )}
    >
      <span className={cn(LABEL, isFake ? "bg-destructive/15 text-destructive" : "bg-muted")}>
        {statement.label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <p
          data-text={statement.text}
          className={cn("text-pretty", isFake && "glitch line-through decoration-destructive/60")}
        >
          {statement.text}
        </p>
        {isFake && (
          <p className="animate-in text-sm text-pretty duration-300 ease-out fade-in fill-mode-both slide-in-from-top-1 delay-300 motion-reduce:animate-none">
            {result.correction}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {isFake && <span className="font-medium text-destructive">Hallucination</span>}
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target inline-flex items-center gap-1 rounded-sm underline-offset-4 hover:text-foreground hover:underline"
            >
              Source
              <ExternalLink aria-hidden className="size-3" />
            </a>
          )}
          {isPick && (
            <span className="inline-flex items-center gap-1">
              {result.correct ? (
                <Check aria-hidden className="size-3.5 text-success" />
              ) : (
                <X aria-hidden className="size-3.5 text-destructive" />
              )}
              Your answer
            </span>
          )}
        </div>
      </div>
      {isPick && !result.correct && (
        <svg
          aria-hidden
          className="cross-out pointer-events-none absolute inset-3 size-[calc(100%-1.5rem)]"
        >
          <line x1="0" y1="0" x2="100%" y2="100%" pathLength={1} />
          <line x1="100%" y1="0" x2="0" y2="100%" pathLength={1} />
        </svg>
      )}
    </div>
  );
}

// A round's result: a green check if correct, a red cross if wrong, empty until answered.
// Icons as well as colour, so it reads without colour.
export function ResultPill({
  correct,
  className,
}: {
  correct: boolean | undefined;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-4 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none",
        correct === undefined
          ? "bg-muted"
          : correct
            ? "bg-success text-background"
            : "bg-destructive text-background",
        className,
      )}
    >
      {correct === true && <Check className="size-3" strokeWidth={3} />}
      {correct === false && <X className="size-3" strokeWidth={3} />}
    </span>
  );
}

// One pill per round of the day. The next round to play is outlined.
export function Progress({ results }: { results: (boolean | undefined)[] }) {
  const correct = results.filter((r) => r === true).length;
  const wrong = results.filter((r) => r === false).length;
  const next = results.indexOf(undefined);

  return (
    <span
      role="img"
      aria-label={`${correct} correct, ${wrong} wrong, ${results.length - correct - wrong} to play`}
      className="flex gap-1"
    >
      {results.map((result, i) => (
        <ResultPill
          key={i}
          correct={result}
          className={cn(i === next && "ring-1 ring-foreground/40")}
        />
      ))}
    </span>
  );
}

export function ProgressSkeleton() {
  return (
    <span aria-hidden className="flex gap-1">
      {Array.from({ length: ROUNDS_PER_DAY }, (_, i) => (
        <Skeleton key={i} className="h-4 w-7 rounded-full" />
      ))}
    </span>
  );
}

// Same boxes as RoundCard before an answer, so nothing shifts when the round lands.
export function RoundCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-20" />
          <ProgressSkeleton />
        </div>
        <Skeleton className="h-7 w-48" />
      </div>
      <Skeleton className="h-4 w-56" />
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className={cn(STATEMENT, "border-border")}>
            <Skeleton className="size-6 shrink-0" />
            <span className="flex flex-1 flex-col gap-2 py-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoundCard({
  round,
  results,
  onAnswered,
  onNext,
}: {
  round: Round;
  results: (boolean | undefined)[];
  onAnswered: () => void;
  onNext: () => void;
}) {
  const feedback = useFeedback();
  const todayKey = trpc.game.today.queryKey();
  const answer = useMutation(
    trpc.game.answer.mutationOptions({
      onSuccess: (result) => {
        feedback(result.correct ? "correct" : "wrong");
        onAnswered();
        queryClient.setQueryData(
          todayKey,
          (today) =>
            today && {
              ...today,
              rounds: today.rounds.map((r) => (r.id === round.id ? { ...r, result } : r)),
            },
        );
        // Picks up the new graph cell, the streak and, after the last round, `done`.
        void queryClient.invalidateQueries({ queryKey: todayKey });
      },
      onError: () => feedback("wrong"),
    }),
  );
  const { result } = round;

  return (
    <section aria-labelledby="round-theme" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground tabular-nums">
            Round {round.number}/{results.length}
          </p>
          <Progress results={results} />
        </div>
        <h2 id="round-theme" className="text-lg font-semibold text-balance">
          {round.theme}
        </h2>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {!result && "Tap the statement you think is fake."}
        {result?.correct && (
          <>
            Correct · <span className="font-medium text-brand">+{result.points} points</span>
          </>
        )}
        {result && !result.correct && (
          <>
            <Glitch className="font-medium text-destructive">Wrong</Glitch> · 0 points
          </>
        )}
      </p>
      <ul className="flex flex-col gap-2">
        {round.statements.map((statement, i) => {
          const pending = answer.isPending && answer.variables.statementId === statement.id;
          return (
            // The <li> outlives the reveal, so the entrance plays once per round, not again on answer.
            <li
              key={statement.id}
              style={{ animationDelay: `${130 + i * 45}ms` }}
              className="animate-in duration-500 ease-out fade-in fill-mode-both slide-in-from-bottom-1 motion-reduce:animate-none"
            >
              {result ? (
                <RevealedStatement statement={statement} result={result} />
              ) : (
                <button
                  type="button"
                  disabled={answer.isPending}
                  aria-busy={pending}
                  onClick={() => answer.mutate({ roundId: round.id, statementId: statement.id })}
                  className={cn(
                    STATEMENT,
                    "cursor-pointer border-border transition-[background-color,border-color,opacity,scale] duration-150 ease-out outline-none hover:border-foreground/20 hover:bg-foreground/3 focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-default motion-reduce:transition-none",
                    pending && "border-foreground/20 bg-foreground/3",
                    answer.isPending && !pending && "opacity-50",
                  )}
                >
                  <span className={cn(LABEL, "bg-muted")}>
                    {pending ? <Spinner className="size-3.5" /> : statement.label}
                  </span>
                  <span className="py-0.5 text-pretty">{statement.text}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {answer.isError && (
        <p role="alert" className="text-xs text-destructive">
          <Glitch>Could not save your answer. Tap a statement to try again.</Glitch>
        </p>
      )}
      {result && (
        // Focus lands here once the tapped button is replaced by the reveal.
        <Button
          size="lg"
          autoFocus
          onClick={() => {
            // Rounds are played in order, so Next on the last one opens the day's score.
            if (round.number === results.length) feedback("complete");
            onNext();
          }}
          className="w-full"
        >
          Next
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </section>
  );
}
