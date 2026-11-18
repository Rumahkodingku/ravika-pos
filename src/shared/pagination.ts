import type { Paginated } from "@/types/api";

export function pageOf<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    total,
    pageCount,
  };
}

export function textMatch(value: string, search?: string) {
  return !search || value.toLowerCase().includes(search.toLowerCase());
}

export function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
