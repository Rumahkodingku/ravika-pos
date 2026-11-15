export const EMPTY_VALUE = "—";

// shortcut: OPEN-003 is not final. Replace with the configured business time zone in Phase 5.
export const DEFAULT_TIME_ZONE = "Asia/Jakarta";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return currencyFormatter.format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return numberFormatter.format(value);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DEFAULT_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: DEFAULT_TIME_ZONE,
    ...options,
  }).format(date);
}
