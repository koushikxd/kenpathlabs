import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "@kenpathlabs/api/routers/index";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Not error.message: on a dropped connection that is the browser's "Failed to fetch".
      toast.error("Could not load. Check your connection.", {
        action: {
          label: "Retry",
          onClick: () => {
            query.invalidate();
          },
        },
      });
    },
  }),
});

let session: Promise<unknown> = Promise.resolve();

// A first visit renders its skeletons straight away while it signs in; requests wait here for the
// session, so no query runs UNAUTHORIZED (see AnonymousSession).
export function holdRequestsUntil(ready: Promise<unknown>) {
  session = ready;
}

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      fetch: async (url, init) => {
        await session;
        return fetch(url, init);
      },
    }),
  ],
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
