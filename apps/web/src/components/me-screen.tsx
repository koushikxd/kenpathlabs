"use client";

import { Button, buttonVariants } from "@kenpathlabs/ui/components/button";
import { Skeleton } from "@kenpathlabs/ui/components/skeleton";
import { Spinner } from "@kenpathlabs/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { AccountForms } from "@/components/account-forms";
import { LoadError } from "@/components/load-error";
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

// `guest` comes from the server's session, so the first paint already has the right header and
// nothing jumps when me.get lands. After that, me.get decides.
export function MeScreen({ guest: guestFromSession }: { guest: boolean }) {
  const me = useQuery(trpc.me.get.queryOptions());
  const guest = me.data?.isAnonymous ?? guestFromSession;

  return (
    <>
      {guest && (
        <>
          <PlayerHeader name="Guest" username={null} rankBadge={null} />
          <p className="-mt-2 text-xs text-pretty text-muted-foreground">
            Sign up to keep your points and appear on the board.
          </p>
          <AccountForms />
        </>
      )}
      {!guest && me.isPending && (
        <>
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-7 w-40 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 rounded-md pointer-coarse:h-11" />
        </>
      )}
      {!guest && me.isSuccess && (
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
      )}
      {me.isPending && <PlayerSummarySkeleton />}
      {me.isError && <LoadError>Could not load your profile.</LoadError>}
      {me.isSuccess && (
        <>
          <PlayerSummary summary={me.data} />
          <PointsLedger ledger={me.data.ledger} />
        </>
      )}
    </>
  );
}
