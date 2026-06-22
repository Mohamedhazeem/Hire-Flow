import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
        queryFn: async ({ queryKey }) => {
          const [path, params] = queryKey as [string, Record<string, unknown>?];
          return apiClient(path, { params });
        },
      },
    },
  });

  return client;
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
