import { AsyncLocalStorage } from "node:async_hooks";

export interface SessionCache {
  session: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId?: string;
    memberRole?: string;
  } | null;
}

const sessionStorage = new AsyncLocalStorage<SessionCache>();

export function getSessionCache(): SessionCache | null {
  return sessionStorage.getStore() ?? null;
}

export function runWithSessionCache<T>(cache: SessionCache, fn: () => Promise<T>): Promise<T> {
  return sessionStorage.run(cache, fn);
}

export function setCachedSession(session: SessionCache["session"]): void {
  const store = sessionStorage.getStore();
  if (store) {
    store.session = session;
  }
}
