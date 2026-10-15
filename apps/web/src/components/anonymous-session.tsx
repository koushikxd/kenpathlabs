"use client";

import { createContext, use, useLayoutEffect, useState } from "react";
import { toast } from "sonner";

import { authClient, ensureAnonymousSession } from "@/lib/auth-client";
import { holdRequestsUntil } from "@/utils/trpc";

const SessionReady = createContext(true);

// False while a first visit signs in. The account forms stay disabled until then: signing up links
// the anonymous player, and a form in the server HTML must not submit natively before hydration.
export function useSessionReady() {
  return use(SessionReady);
}

// Gives a first visit a session before any game query runs, without holding up the page: the
// skeletons render at once while requests wait in the tRPC link.
// `hasSession` comes from the server, so returning visitors skip a get-session round trip.
export default function AnonymousSession({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(hasSession);

  // A layout effect: React runs it before any passive effect in the commit, so the hold is in place
  // before the children's queries fetch. `hasSession` never changes: the dock layout persists.
  useLayoutEffect(() => {
    // Extends the session cookie (see readSession). Not awaited, so it never holds up the queries.
    // A failure is harmless: the next load tries again.
    if (hasSession) {
      authClient.getSession().catch(() => {});
      return;
    }
    const signedIn = ensureAnonymousSession();
    // On a failure requests stay held, behind the toast.
    holdRequestsUntil(signedIn.then((ok) => ok || new Promise(() => {})));
    void signedIn.then((ok) => {
      if (ok) return setReady(true);
      toast.error("Could not connect. Check your connection.", {
        id: "anonymous-session",
        // Stays up: without it there is no way out of the skeletons.
        duration: Infinity,
        // A reload, not another sign-in: a failed response may still have set the cookie,
        // and Better-Auth rejects an anonymous sign-in from an anonymous session.
        action: { label: "Retry", onClick: () => location.reload() },
      });
    });
  }, [hasSession]);

  return <SessionReady value={ready}>{children}</SessionReady>;
}
