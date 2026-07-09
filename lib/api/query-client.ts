import { QueryClient, QueryKey } from "@tanstack/react-query";
import { apiClient } from "./api-client";
import { UnauthorizedError, ForbiddenError } from "./api-error";

type QueryKeyShape = [string, Record<string, unknown>?];

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 30_000,
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

async function defaultQueryFn({ queryKey }: { queryKey: QueryKey }) {
  const [path, params] = queryKey as QueryKeyShape;
  try {
    return await apiClient(path, { params });
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      window.location.href = "/login";
    }
    throw error;
  }
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...DEFAULT_QUERY_OPTIONS,
        queryFn: defaultQueryFn,
      },
    },
  });
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
