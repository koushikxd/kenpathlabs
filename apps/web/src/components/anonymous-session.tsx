"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ensureAnonymousSession } from "@/lib/auth-client";

import Loader from "./loader";

// Holds the app until a session exists, so the first game queries are never UNAUTHORIZED.
// `hasSession` comes from the server, so returning visitors skip a get-session round trip.
export default function AnonymousSession({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(hasSession);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (ready) return;
    void ensureAnonymousSession().then((ok) => {
      if (ok) return setReady(true);
      toast.error("Could not start a session", {
        id: "anonymous-session",
        // Stays up: without it there is no way out of the loader.
        duration: Infinity,
        action: { label: "retry", onClick: () => setAttempt((n) => n + 1) },
      });
    });
  }, [ready, attempt]);

  return ready ? children : <Loader />;
}
