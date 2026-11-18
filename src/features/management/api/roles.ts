"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";

export type RoleOption = {
  id: string;
  code: string;
  name: string;
};

export function useRoleOptionsQuery() {
  return useQuery({
    queryFn: () => apiFetch<RoleOption[]>("/roles/options"),
    queryKey: queryKeys.roleOptions,
  });
}
