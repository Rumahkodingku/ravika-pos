"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Permission, Role } from "@/types/domain";

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

export function useRolesQuery() {
  return useQuery({
    queryFn: () => apiFetch<Role[]>("/roles"),
    queryKey: queryKeys.roles,
  });
}

export function usePermissionsQuery() {
  return useQuery({
    queryFn: () => apiFetch<Permission[]>("/permissions"),
    queryKey: queryKeys.permissions,
  });
}

export type CreateRoleInput = {
  name: string;
  code: string;
  description: string;
  permissionCodes: string[];
};

export type UpdateRoleInput = Omit<CreateRoleInput, "permissionCodes">;

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      apiFetch<Role>("/roles", { body: input, method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.roles }),
  });
}

function useRoleInvalidation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.roles });
    queryClient.invalidateQueries({ queryKey: queryKeys.permissions });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    router.refresh();
  };
}

export function useSetRolePermissionsMutation() {
  const onSuccess = useRoleInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      permissionCodes,
    }: {
      id: string;
      permissionCodes: string[];
    }) =>
      apiFetch<Role>(`/roles/${id}/permissions`, {
        body: { permissionCodes },
        method: "PUT",
      }),
    onSuccess,
  });
}

export function useUpdateRoleMutation() {
  const onSuccess = useRoleInvalidation();

  return useMutation({
    mutationFn: async ({
      id,
      input,
      permissionCodes,
    }: {
      id: string;
      input: UpdateRoleInput;
      permissionCodes: string[];
    }) => {
      await apiFetch<Role>(`/roles/${id}`, { body: input, method: "PATCH" });

      return apiFetch<Role>(`/roles/${id}/permissions`, {
        body: { permissionCodes },
        method: "PUT",
      });
    },
    onSuccess,
  });
}
