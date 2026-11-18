"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Paginated, UserListParams } from "@/types/api";
import type { ManagementUser } from "@/types/domain";

function usersPath(params: UserListParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `/users?${search}` : "/users";
}

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryFn: () => apiFetch<Paginated<ManagementUser>>(usersPath(params)),
    queryKey: queryKeys.users(params),
  });
}

export type CreateUserInput = {
  name: string;
  email: string;
  username?: string;
  role: string;
  password: string;
  isActive: boolean;
};

export type UpdateUserInput = Omit<CreateUserInput, "password">;

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      apiFetch<ManagementUser>("/users", { body: input, method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      apiFetch<ManagementUser>(`/users/${id}`, {
        body: input,
        method: "PATCH",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
