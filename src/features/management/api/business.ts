"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Business } from "@/types/domain";

export type BusinessInput = {
  name: string;
  code: string;
  address: string;
  phone: string;
};

export function useBusinessQuery() {
  return useQuery({
    queryFn: () => apiFetch<Business>("/business"),
    queryKey: queryKeys.business,
  });
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BusinessInput) =>
      apiFetch<Business>("/business", { body: input, method: "PATCH" }),
    onSuccess: (business) => {
      queryClient.setQueryData(queryKeys.business, business);
      queryClient.invalidateQueries({ queryKey: queryKeys.business });
    },
  });
}
