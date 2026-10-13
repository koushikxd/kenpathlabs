import { anonymousClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { queryClient } from "@/utils/trpc";

export const authClient = createAuthClient({ plugins: [anonymousClient(), usernameClient()] });

let pending: Promise<boolean> | undefined;

// Shared so it runs once: React dev runs effects twice, and two calls without a cookie create two users.
// Resolves false on an error response or a network failure (which rejects).
export function ensureAnonymousSession() {
  pending ??= authClient.signIn.anonymous().then(
    (result) => !result.error,
    () => false,
  );
  return pending;
}

// Reset, not invalidate: invalidate keeps the previous account's data on screen until the refetch lands.
function resetOnSuccess<T extends { error: unknown }>(result: T) {
  if (!result.error) void queryClient.resetQueries();
  return result;
}

export function signUp(input: { name: string; username: string; email: string; password: string }) {
  return authClient.signUp.email(input).then(resetOnSuccess);
}

export function signIn(input: { email: string; password: string }) {
  return authClient.signIn.email(input).then(resetOnSuccess);
}

// Every visitor needs a session, so signing out starts a new anonymous one before queries refetch.
// If that fails, a reload lands in AnonymousSession, which can retry.
export async function signOut() {
  const result = await authClient.signOut();
  if (result.error) return result;
  const anonymous = await authClient.signIn.anonymous().catch(() => null);
  if (anonymous?.data) void queryClient.resetQueries();
  else location.reload();
  return result;
}
