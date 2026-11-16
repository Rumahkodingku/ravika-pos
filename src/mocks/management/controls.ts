let latencyMs = 450;
let failNext = false;

export function setLatency(value: number) {
  latencyMs = Math.max(0, value);
}

export function getLatency() {
  return latencyMs;
}

export function failNextRequest() {
  failNext = true;
}

export function consumeFailure() {
  const shouldFail = failNext;
  failNext = false;
  return shouldFail;
}

export function resetControls() {
  latencyMs = 450;
  failNext = false;
}
