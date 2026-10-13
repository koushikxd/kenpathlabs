import { anonymousClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { queryClient } from "@/utils/trpc";

export const authClient = createAuthClient({ plugins: [anonymousClient(), usernameClient()] });

let pending: Promise<boolean> | undefined;

// Shared so it runs once: React dev runs effects twice, and two calls without a cookie create two users.
// Resolves false on an error response or a network failure (which rejects), and clears itself so a retry can run.
export function ensureAnonymousSession() {
  pending ??= authClient.signIn
    .anonymous()
    .then(
      (result) => !result.error,
      () => false,
    )
    .then((ok) => {
      if (!ok) pending = undefined;
      return ok;
    });
  return pending;
}

function refetchOnSuccess<T extends { error: unknown }>(result: T) {
  if (!result.error) void queryClient.invalidateQueries();
  return result;
}

export function signUp(input: { name: string; username: string; email: string; password: string }) {
  return authClient.signUp.email(input).then(refetchOnSuccess);
}

export function signIn(input: { email: string; password: string }) {
  return authClient.signIn.email(input).then(refetchOnSuccess);
}

// Every visitor needs a session, so signing out starts a new anonymous one before queries refetch.
export async function signOut() {
  const result = await authClient.signOut();
  if (result.error) return result;
  return refetchOnSuccess(await authClient.signIn.anonymous());
}
