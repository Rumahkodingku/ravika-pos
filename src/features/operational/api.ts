"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import {
  useAddOnsQuery,
  useCategoriesQuery,
  useProductsQuery,
} from "@/features/management/api/catalog";
import { useTablesQuery } from "@/features/management/api/tables";
import { apiFetch } from "@/lib/api/client";
import {
  createIdempotencyKey,
  idempotencyHeaders,
  shouldRotateIdempotencyKey,
} from "@/lib/api/idempotency";
import { queryKeys } from "@/lib/api/keys";
import type { Order, OrderType, Payment, PaymentMethod } from "@/types/domain";

export { useBusinessQuery } from "@/features/management/api/business";

export type CreateOrderInput = {
  orderType: OrderType;
  tableId: string | null;
  notes: string;
  items: Array<{
    productId: string;
    variantId: string | null;
    addOnIds: string[];
    quantity: number;
    notes: string;
  }>;
};

export type RecordPaymentInput = {
  orderId: string;
  key: string;
  method: PaymentMethod;
  amount: number;
  reference: string;
  notes: string;
  verified: boolean;
};

export function usePosCatalogQuery() {
  const categories = useCategoriesQuery({ pageSize: 100 });
  const products = useProductsQuery({ pageSize: 100 });
  const addOns = useAddOnsQuery();

  return {
    categories: categories.data?.items ?? [],
    products: products.data?.items ?? [],
    addOns: addOns.data ?? [],
    isLoading: categories.isLoading || products.isLoading || addOns.isLoading,
  };
}

export function usePosTablesQuery() {
  return useTablesQuery({ pageSize: 100 });
}

export function usePayableOrdersQuery() {
  return useQuery({
    queryFn: () => apiFetch<Order[]>("/orders/payable"),
    queryKey: queryKeys.payableOrders,
  });
}

function useOrderInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
    queryClient.invalidateQueries({ queryKey: ["kds"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useCreateOrderMutation() {
  const invalidateOrders = useOrderInvalidation();
  const keyRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      keyRef.current ??= createIdempotencyKey();

      try {
        return await apiFetch<Order>("/orders", {
          body: input,
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
    },
  });
}

export function useRecordPaymentMutation() {
  const invalidateOrders = useOrderInvalidation();
  const keyRef = useRef<string | null>(null);
  const orderIdRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async ({ key, orderId, ...input }: RecordPaymentInput) => {
      if (orderIdRef.current !== orderId) {
        keyRef.current = null;
        orderIdRef.current = orderId;
      }
      keyRef.current ??= key;

      try {
        return await apiFetch<Payment>(`/orders/${orderId}/payments`, {
          body: input,
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
    },
  });
}
