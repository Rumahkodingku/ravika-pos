"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type {
  DashboardFilters,
  SalesReportParams,
  TopProductsParams,
} from "@/types/api";
import type { DashboardSummary, SalesReport } from "@/types/domain";

function reportPath(path: string, params: Record<string, unknown>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `${path}?${search}` : path;
}

export function useDashboardQuery(filters: DashboardFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () =>
      apiFetch<DashboardSummary>(reportPath("/reports/summary", filters)),
    queryKey: queryKeys.reportSummary(filters),
  });
}

export function useSalesReportQuery(filters: SalesReportParams) {
  return useQuery({
    queryFn: () => apiFetch<SalesReport>(reportPath("/reports/sales", filters)),
    queryKey: queryKeys.salesReport(filters),
  });
}

export function useTopProductsQuery(filters: TopProductsParams) {
  return useQuery({
    queryFn: () =>
      apiFetch<SalesReport["topProducts"]>(
        reportPath("/reports/top-products", filters),
      ),
    queryKey: queryKeys.topProducts(filters),
  });
}
