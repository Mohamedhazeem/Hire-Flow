import { toAbsoluteUrl } from "@/utils/url";
import { ApiError } from "./api-error";

export async function apiClient<T = unknown>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const { method = "GET", body, params, headers: extraHeaders } = options ?? {};

  let url = toAbsoluteUrl(path);

  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    ...extraHeaders,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(json.message ?? `Request failed with status ${res.status}`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
