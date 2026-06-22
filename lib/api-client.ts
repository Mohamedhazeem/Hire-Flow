export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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

  let url = path;
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

  return res.json() as Promise<T>;
}
