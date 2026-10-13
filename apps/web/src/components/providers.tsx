"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@kenpathlabs/ui/components/sonner";

import { queryClient } from "@/utils/trpc";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
      {/* At the top on phones, where it clears the dock; sonner adds no safe-area inset itself. */}
      <Toaster
        richColors
        theme="dark"
        position="top-center"
        mobileOffset={{ top: "calc(1rem + env(safe-area-inset-top))" }}
      />
    </QueryClientProvider>
  );
}
