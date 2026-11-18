"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";

export type SetupStatus = { setupRequired: boolean };

export type SetupInput = {
  address: string;
  businessCode: string;
  businessName: string;
  confirmPassword: string;
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string;
  ownerUsername?: string;
  phone: string;
};

export function useSetupStatusQuery() {
  return useQuery({
    queryFn: () => apiFetch<SetupStatus>("/setup/status"),
    queryKey: queryKeys.setupStatus,
  });
}

export function useSetupMutation() {
  return useMutation({
    mutationFn: (input: SetupInput) =>
      apiFetch<{ restartRequired: boolean; setupComplete: boolean }>("/setup", {
        body: input,
        method: "POST",
      }),
  });
}
