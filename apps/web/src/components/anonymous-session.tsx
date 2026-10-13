"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient, ensureAnonymousSession } from "@/lib/auth-client";

import Loader from "./loader";

// Holds the app until a session exists, so the first game queries are never UNAUTHORIZED.
// `hasSession` comes from the server, so returning visitors skip a get-session round trip before rendering.
export default function AnonymousSession({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(hasSession);

  // Extends the session cookie (see readSession). Not awaited, so it never holds up the queries.
  // A failure is harmless: the next load tries again.
  useEffect(() => {
    if (hasSession) authClient.getSession().catch(() => {});
  }, [hasSession]);

  useEffect(() => {
    if (ready) return;
    void ensureAnonymousSession().then((ok) => {
      if (ok) return setReady(true);
      toast.error("Could not start a session", {
        id: "anonymous-session",
        // Stays up: without it there is no way out of the loader.
        duration: Infinity,
        // A reload, not another sign-in: a failed response may still have set the cookie,
        // and Better-Auth rejects an anonymous sign-in from an anonymous session.
        action: { label: "retry", onClick: () => location.reload() },
      });
    });
  }, [ready]);

  return ready ? children : <Loader />;
}
