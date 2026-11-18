"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Paginated, PaymentListParams } from "@/types/api";
import type { Payment } from "@/types/domain";

function paymentsPath(params: PaymentListParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `/payments?${search}` : "/payments";
}

export function usePaymentsQuery(params: PaymentListParams) {
  return useQuery({
    queryFn: () => apiFetch<Paginated<Payment>>(paymentsPath(params)),
    queryKey: queryKeys.payments(params),
  });
}

export function usePaymentQuery(id: string | null) {
  return useQuery({
    enabled: id !== null,
    queryFn: () => apiFetch<Payment>(`/payments/${id}`),
    queryKey: queryKeys.payment(id ?? ""),
  });
}
