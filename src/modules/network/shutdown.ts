export function registerShutdownHandlers(handler: () => void) {
  process.once("SIGTERM", handler);
  process.once("SIGINT", handler);
}
