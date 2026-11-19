"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  createIdempotencyKey,
  idempotencyHeaders,
  shouldRotateIdempotencyKey,
} from "@/lib/api/idempotency";
import { queryKeys } from "@/lib/api/keys";
import type { PublicMenuResponse } from "@/types/api";
import type { PaymentStatus, PreparationStatus } from "@/types/ui";

export type PublicOrderCreated = {
  orderNumber: string;
  publicToken: string;
  grandTotal: number;
  cashTendered: number | null;
  tableName: string | null;
};

export type PublicOrderInput = {
  tableToken: string;
  notes: string;
  cashTendered: number | null;
  items: Array<{
    productId: string;
    variantId: string | null;
    addOnIds: string[];
    quantity: number;
    notes: string;
  }>;
};

export function usePublicMenuQuery(token: string) {
  return useQuery({
    queryFn: () =>
      apiFetch<PublicMenuResponse>(`/public/menu/${encodeURIComponent(token)}`),
    queryKey: queryKeys.publicMenu(token),
    staleTime: 60_000,
  });
}

export type PublicOrderStatus = {
  orderNumber: string;
  orderStatus: PreparationStatus;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  cashTendered: number | null;
  tableName: string | null;
  createdAt: string;
  items: Array<{
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    addOns: Array<{ name: string; price: number; quantity: number }>;
  }>;
};

export function usePublicOrderQuery(token: string) {
  return useQuery({
    queryFn: () =>
      apiFetch<PublicOrderStatus>(
        `/public/orders/${encodeURIComponent(token)}`,
      ),
    queryKey: queryKeys.publicOrder(token),
    refetchInterval: 10_000,
  });
}

export function useCreatePublicOrderMutation() {
  const keyRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: async (input: PublicOrderInput) => {
      keyRef.current ??= createIdempotencyKey();

      try {
        return await apiFetch<PublicOrderCreated>("/public/orders", {
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
    },
  });
}
