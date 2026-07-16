import debug from "debug";

const APP_NAMESPACE = "app";

// Define the shape of our multi-level logger
type LogMethods = {
  info: debug.Debugger;
  warn: debug.Debugger;
  error: debug.Debugger;
};

export function createLogger(scope: string): LogMethods {
  // Create three sub-namespaces for each scope
  const instances = {
    info: debug(`${APP_NAMESPACE}:${scope}:info`),
    warn: debug(`${APP_NAMESPACE}:${scope}:warn`),
    error: debug(`${APP_NAMESPACE}:${scope}:error`),
  };

  // Browser log initialization guard
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const activeDebugs = localStorage.getItem("debug");
    if (activeDebugs) {
      debug.enable(activeDebugs);
    }
  }

  return instances;
}

// Pre-defined instances for your application
export const logger = {
  server: createLogger("server"),
  client: createLogger("client"),
  api: createLogger("api"),
  db: createLogger("database"),
};
