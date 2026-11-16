import { createInitialState } from "@/mocks/management/seed";

export type ManagementState = ReturnType<typeof createInitialState>;

type StoreListener = () => void;

type StoreMessage =
  | { type: "request-state" }
  | { type: "snapshot"; state: ManagementState }
  | { type: "state"; state: ManagementState }
  | { type: "reset"; state: ManagementState };

const CHANNEL_NAME = "ravika-management-store";

let state: ManagementState = createInitialState();
const listeners = new Set<StoreListener>();
let channel: BroadcastChannel | null = null;
let receivedSnapshot = false;

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function applyState(nextState: ManagementState) {
  state = nextState;
  notify();
}

// shortcut: full-state BroadcastChannel sync, last write wins.
// Replace with API/SSE in Phase 6-7.
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  // Let hydration finish before a peer snapshot can replace the server state.
  window.setTimeout(() => {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<StoreMessage>) => {
      const message = event.data;

      if (message.type === "request-state") {
        channel?.postMessage({ type: "snapshot", state });
        return;
      }

      if (message.type === "snapshot") {
        if (receivedSnapshot) {
          return;
        }
        receivedSnapshot = true;
        applyState(message.state);
        return;
      }

      receivedSnapshot = true;
      applyState(message.state);
    };
    channel.postMessage({ type: "request-state" });
  }, 0);
}

export function getState() {
  return state;
}

export function setState(
  updater: (current: ManagementState) => ManagementState,
) {
  state = updater(state);
  notify();
  channel?.postMessage({ type: "state", state });
}

export function subscribe(listener: StoreListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reset() {
  state = createInitialState();
  notify();
  channel?.postMessage({ type: "reset", state });
}
