export const hydrator = {
  subscribe: (cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    cb();
    return () => {};
  },
  getSnapshot: () => (typeof window !== "undefined" ? "client" : "server"),
  getServerSnapshot: () => "server",
};
