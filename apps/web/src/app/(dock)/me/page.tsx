"use client";

import { Button, buttonVariants } from "@kenpathlabs/ui/components/button";
import { Spinner } from "@kenpathlabs/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { AccountForms } from "@/components/account-forms";
import { PlayerHeader, PlayerSummary, PlayerSummarySkeleton } from "@/components/player-summary";
import { PointsLedger } from "@/components/points-ledger";
import { signOut } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function SignOutButton() {
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await signOut();
      if (error) throw error;
    },
    onError: () => toast.error("Could not sign out."),
  });
  return (
    <Button variant="ghost" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending && <Spinner data-icon="inline-start" />}
      Sign out
    </Button>
  );
}

export default function MePage() {
  const me = useQuery(trpc.me.get.queryOptions());

  return (
    <>
      {me.isPending && (
        <div
          className="flex animate-in flex-col gap-5 duration-500 ease-out fade-in fill-mode-both"
          style={{ animationDelay: "500ms" }}
        >
          <PlayerSummarySkeleton />
        </div>
      )}
      {me.isError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          Could not load your profile.
        </p>
      )}
      {me.isSuccess &&
        (me.data.isAnonymous ? (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold">Guest</h1>
              <p className="text-xs text-pretty text-muted-foreground">
                Sign up to keep your points and get on the board.
              </p>
            </div>
            <AccountForms />
          </>
        ) : (
          <>
            <PlayerHeader
              name={me.data.name}
              username={me.data.username}
              rankBadge={me.data.rankBadge}
            />
            <div className="flex flex-wrap items-center gap-2">
              {me.data.username && (
                <Link
                  href={`/u/${me.data.username}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  View profile
                </Link>
              )}
              <SignOutButton />
            </div>
          </>
        ))}
      {me.isSuccess && (
        <>
          <PlayerSummary summary={me.data} />
          <PointsLedger ledger={me.data.ledger} />
        </>
      )}
    </>
  );
}
