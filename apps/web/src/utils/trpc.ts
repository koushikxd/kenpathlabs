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

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
