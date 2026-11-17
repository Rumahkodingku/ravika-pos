export function now() {
  return new Date();
}

export function toIso(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}
