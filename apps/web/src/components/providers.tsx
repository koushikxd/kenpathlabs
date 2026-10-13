"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@kenpathlabs/ui/components/sonner";

import { queryClient } from "@/utils/trpc";

import AnonymousSession from "./anonymous-session";

export default function Providers({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AnonymousSession hasSession={hasSession}>{children}</AnonymousSession>
      <ReactQueryDevtools />
      <Toaster richColors theme="dark" />
    </QueryClientProvider>
  );
}
