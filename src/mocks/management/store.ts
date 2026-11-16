import { createInitialState } from "@/mocks/management/seed";

export type ManagementState = ReturnType<typeof createInitialState>;

type StoreListener = () => void;

let state: ManagementState = createInitialState();
const listeners = new Set<StoreListener>();

export function getState() {
  return state;
}

export function setState(
  updater: (current: ManagementState) => ManagementState,
) {
  state = updater(state);
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: StoreListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function reset() {
  state = createInitialState();
  for (const listener of listeners) {
    listener();
  }
}
