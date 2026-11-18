"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { landingPathForPermissions } from "@/features/auth/landing";
import { apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/types/auth";

export type LoginInput = {
  identity: string;
  password: string;
  remember: boolean;
};

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<SessionUser>("/auth/login", { body: input, method: "POST" }),
    onSuccess: (user) => {
      queryClient.clear();
      router.replace(landingPathForPermissions(user.permissions));
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}
