"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { Paginated, TableListParams } from "@/types/api";
import type { DiningTable, TableStatus, TableSummary } from "@/types/domain";

function tablesPath(params: TableListParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `/tables?${search}` : "/tables";
}

export type TableInput = {
  name: string;
  status: TableStatus;
  isActive: boolean;
};

export type TableTokenResponse = {
  table: DiningTable;
  qrToken: string;
};

function useTableInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "tables" && query.queryKey[1] !== "detail",
    });
  };
}

export function useTablesQuery(params: TableListParams) {
  return useQuery({
    queryFn: () => apiFetch<Paginated<TableSummary>>(tablesPath(params)),
    queryKey: queryKeys.tables(params),
  });
}

export function useTableQuery(
  id: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: () => apiFetch<DiningTable>(`/tables/${id}`),
    queryKey: queryKeys.table(id ?? ""),
  });
}

export function useCreateTableMutation() {
  const queryClient = useQueryClient();
  const invalidateTables = useTableInvalidation();

  return useMutation({
    mutationFn: (input: TableInput) =>
      apiFetch<DiningTable>("/tables", { body: input, method: "POST" }),
    onSuccess: (table) => {
      queryClient.setQueryData(queryKeys.table(table.id), table);
      invalidateTables();
    },
  });
}

export function useUpdateTableMutation() {
  const queryClient = useQueryClient();
  const invalidateTables = useTableInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TableInput }) =>
      apiFetch<DiningTable>(`/tables/${id}`, { body: input, method: "PATCH" }),
    onSuccess: (table) => {
      queryClient.setQueryData(queryKeys.table(table.id), table);
      invalidateTables();
    },
  });
}

export function useRegenerateTableQrMutation() {
  const queryClient = useQueryClient();
  const invalidateTables = useTableInvalidation();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<TableTokenResponse>(`/tables/${id}/regenerate-qr`, {
        method: "POST",
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.table(result.table.id), result.table);
      invalidateTables();
    },
  });
}
