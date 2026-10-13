import { Button } from "@kenpathlabs/ui/components/button";
import { Spinner } from "@kenpathlabs/ui/components/spinner";
import { cn } from "@kenpathlabs/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, ExternalLink, X } from "lucide-react";

import { queryClient, trpc, type RouterOutputs } from "@/utils/trpc";

type Round = RouterOutputs["game"]["today"]["rounds"][number];
type Statement = Round["statements"][number];
type Result = NonNullable<Round["result"]>;

const STATEMENT = "flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm";
const LABEL =
  "flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-medium";

function RevealedStatement({ statement, result }: { statement: Statement; result: Result }) {
  const isFake = statement.id === result.fakeId;
  const isPick = statement.id === result.pickedId;
  const source = result.sources.find((s) => s.statementId === statement.id)?.url;

  return (
    <div
      className={cn(STATEMENT, isFake ? "border-destructive/40 bg-destructive/5" : "border-border")}
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
        {isFake && <p className="text-xs/relaxed text-pretty">{result.correction}</p>}
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
    </div>
  );
}

export function RoundCard({
  round,
  total,
  onAnswered,
  onNext,
}: {
  round: Round;
  total: number;
  onAnswered: () => void;
  onNext: () => void;
}) {
  const todayKey = trpc.game.today.queryKey();
  const answer = useMutation(
    trpc.game.answer.mutationOptions({
      onSuccess: (result) => {
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
    }),
  );
  const { result } = round;

  return (
    <section aria-labelledby="round-theme" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground tabular-nums">
          Round {round.number}/{total}
        </p>
        <h2 id="round-theme" className="text-sm font-medium text-balance">
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
        {result && !result.correct && "Wrong · 0 points"}
      </p>
      <ul className="flex flex-col gap-2">
        {round.statements.map((statement) => {
          const pending = answer.isPending && answer.variables.statementId === statement.id;
          return (
            <li key={statement.id}>
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
                    "border-border transition-[background-color,opacity,transform] duration-150 ease-out outline-none hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px motion-reduce:transition-none",
                    pending && "bg-muted/40",
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
          Could not save your answer. Tap a statement to try again.
        </p>
      )}
      {result && (
        // Focus lands here once the tapped button is replaced by the reveal.
        <Button size="lg" autoFocus onClick={onNext} className="w-full rounded-md">
          Next
          <ArrowRight data-icon="inline-end" />
        </Button>
      )}
    </section>
  );
}
