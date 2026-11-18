"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Order } from "@/types/domain";
import type { PreparationStatus } from "@/types/ui";

export type KdsOrders = {
  active: Order[];
  completed: Order[];
};

export type KdsNextStatus = Extract<
  PreparationStatus,
  "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED"
>;

export function useKdsOrdersQuery() {
  return useQuery({
    queryFn: () => apiFetch<KdsOrders>("/kds/orders"),
    queryKey: queryKeys.kds,
  });
}

export function useUpdateKdsStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nextStatus,
      orderId,
    }: {
      orderId: string;
      nextStatus: KdsNextStatus;
    }) =>
      apiFetch<Order>(`/kds/orders/${orderId}/status`, {
        body: { nextStatus },
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kds"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
