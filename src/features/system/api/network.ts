"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { NetworkStatus } from "@/types/network";

export function useNetworkStatusQuery() {
  return useQuery({
    queryFn: () => apiFetch<NetworkStatus>("/system/network"),
    queryKey: queryKeys.network,
    refetchInterval: 10_000,
  });
}

export function usePreferredInterfaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interfaceId: string) =>
      apiFetch<NetworkStatus>("/system/network/preferred", {
        body: { interfaceId },
        method: "PATCH",
      }),
    onSuccess: (status) => {
      queryClient.setQueryData(queryKeys.network, status);
    },
  });
}
