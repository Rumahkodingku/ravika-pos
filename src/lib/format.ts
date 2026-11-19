export const EMPTY_VALUE = "Tidak ada";
export const EMPTY_DATE = "Belum ada";

// shortcut: OPEN-003 is not final. Replace with the configured business time zone in Phase 5.
export const DEFAULT_TIME_ZONE = "Asia/Jakarta";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

const compactNumberFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return currencyFormatter.format(value);
}

// Number inputs change value on mouse wheel; parse digits from text instead.
export function parseCurrencyInput(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits ? Number(digits) : 0;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return numberFormatter.format(value);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return compactNumberFormatter.format(value);
}

export function formatCompactCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EMPTY_VALUE;
  }

  return `Rp${compactNumberFormatter.format(value)}`;
}

export function formatDateTime(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
) {
  if (!value) {
    return EMPTY_DATE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_DATE;
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
    return EMPTY_DATE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_DATE;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: DEFAULT_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatElapsed(
  value: string | Date | null | undefined,
  now: Date = new Date(),
) {
  if (!value) {
    return EMPTY_VALUE;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 60_000),
  );

  if (minutes < 1) {
    return "< 1 mnt";
  }
  if (minutes < 60) {
    return `${minutes} mnt`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest > 0 ? `${hours} j ${rest} mnt` : `${hours} j`;
}
