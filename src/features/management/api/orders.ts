"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  createIdempotencyKey,
  idempotencyHeaders,
  shouldRotateIdempotencyKey,
} from "@/lib/api/idempotency";
import { queryKeys } from "@/lib/api/keys";
import type { OrderListParams, Paginated } from "@/types/api";
import type {
  Order,
  OrderStatusHistory,
  Payment,
  Refund,
} from "@/types/domain";

function ordersPath(params: OrderListParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `/orders?${search}` : "/orders";
}

function useOrderInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
    queryClient.invalidateQueries({ queryKey: ["kds"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useOrdersQuery(params: OrderListParams) {
  return useQuery({
    queryFn: () => apiFetch<Paginated<Order>>(ordersPath(params)),
    queryKey: queryKeys.orders(params),
  });
}

export function useOrderQuery(
  id: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    enabled: (options.enabled ?? true) && id !== null,
    queryFn: () => apiFetch<Order>(`/orders/${id}`),
    queryKey: queryKeys.order(id ?? ""),
  });
}

export function useOrderHistoryQuery(
  id: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    enabled: (options.enabled ?? true) && id !== null,
    queryFn: () => apiFetch<OrderStatusHistory[]>(`/orders/${id}/history`),
    queryKey: queryKeys.orderHistory(id ?? ""),
  });
}

export function useOrderPaymentsQuery(
  id: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    enabled: (options.enabled ?? true) && id !== null,
    queryFn: () => apiFetch<Payment[]>(`/orders/${id}/payments`),
    queryKey: queryKeys.orderPayments(id ?? ""),
  });
}

export function useCancelOrderMutation() {
  const invalidateOrders = useOrderInvalidation();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<Order>(`/orders/${id}/cancel`, {
        body: { reason },
        method: "POST",
      }),
    onSuccess: invalidateOrders,
  });
}

export function useRefundOrderMutation() {
  const queryClient = useQueryClient();
  const invalidateOrders = useOrderInvalidation();
  const keyRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      keyRef.current ??= createIdempotencyKey();

      try {
        return await apiFetch<Refund>(`/orders/${id}/refund`, {
          body: { reason },
          headers: idempotencyHeaders(keyRef.current),
          method: "POST",
        });
      } catch (error) {
        if (shouldRotateIdempotencyKey(error)) {
          keyRef.current = null;
        }
        throw error;
      }
    },
    onSuccess: () => {
      keyRef.current = null;
      invalidateOrders();
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
