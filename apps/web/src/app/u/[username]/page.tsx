import { appRouter } from "@kenpathlabs/api/routers/index";
import { t } from "@kenpathlabs/api";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PlayerHeader, PlayerSummary } from "@/components/player-summary";
import { createContext } from "@/server/context";

const createCaller = t.createCallerFactory(appRouter);

// Through the procedure, so the not-found rule and season finalization stay in one place.
async function findProfile(username: string) {
  const caller = createCaller(await createContext(await headers()));
  try {
    return await caller.profile.byUsername({ username });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}

// No loading.tsx on this route: notFound() only sets a 404 status before the response streams.
export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const profile = await findProfile((await params).username);

  return (
    <>
      <PlayerHeader
        name={profile.name}
        username={profile.username}
        isBot={profile.isBot}
        rankBadge={profile.rankBadge}
      />
      <PlayerSummary summary={profile} />
    </>
  );
}
