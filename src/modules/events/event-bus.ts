import "server-only";

export type RealtimeEvent = {
  id: string;
  type:
    | "order.created"
    | "order.status_changed"
    | "payment.status_changed"
    | "order.refunded";
  data: Record<string, unknown>;
};

type Listener = (event: RealtimeEvent) => void;

// shortcut: single-process event bus; replace with shared transport if multi-process.
const listeners = new Set<Listener>();

export function subscribeRealtime(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishRealtime(
  type: RealtimeEvent["type"],
  data: Record<string, unknown>,
) {
  const event: RealtimeEvent = { id: crypto.randomUUID(), type, data };
  for (const listener of listeners) {
    listener(event);
  }
}
