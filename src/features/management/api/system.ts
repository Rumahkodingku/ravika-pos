"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRestartRequired } from "@/features/system/restart-required";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { BackupRecord } from "@/types/domain";

export type RestoreBackupResponse = {
  restored: boolean;
  restartRequired: boolean;
};

export function useBackupsQuery() {
  return useQuery({
    queryFn: () => apiFetch<BackupRecord[]>("/backup"),
    queryKey: queryKeys.backups,
  });
}

export function useCreateBackupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<BackupRecord>("/backup", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backups });
    },
  });
}

export function useRestoreBackupMutation() {
  const { requireRestart } = useRestartRequired();

  return useMutation({
    mutationFn: (backupId: string) =>
      apiFetch<RestoreBackupResponse>("/backup/restore", {
        body: { backupId, confirm: true },
        method: "POST",
      }),
    onSuccess: requireRestart,
  });
}
