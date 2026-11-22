"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Armchair, Eye, Pencil, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ResponsiveList } from "@/components/data-table/responsive-list";
import { TableActions } from "@/components/data-table/table-actions";
import { TablePagination } from "@/components/data-table/table-pagination";
import { TableSkeleton } from "@/components/data-table/table-skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/auth/session-provider";
import {
  useCreateTableMutation,
  useRegenerateTableQrMutation,
  useTableQuery,
  useTablesQuery,
  useUpdateTableMutation,
} from "@/features/management/api/tables";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { TableQrCode } from "@/features/management/table-qr-code";
import type { TableStatus, TableSummary } from "@/types/domain";

const tableSchema = z.object({
  name: z.string().min(1, "Nama meja wajib diisi."),
  status: z.enum(["AVAILABLE", "OCCUPIED", "INACTIVE"]),
  isActive: z.boolean(),
});

type TableValues = z.infer<typeof tableSchema>;

const statusLabels: Record<TableStatus, string> = {
  AVAILABLE: "Tersedia",
  OCCUPIED: "Terisi",
  INACTIVE: "Nonaktif",
};

const statusTones: Record<TableStatus, "success" | "warning" | "neutral"> = {
  AVAILABLE: "success",
  OCCUPIED: "warning",
  INACTIVE: "neutral",
};

type TableEditFields = Pick<
  TableSummary,
  "id" | "name" | "status" | "isActive"
>;

const emptyTable: TableValues = {
  name: "",
  status: "AVAILABLE",
  isActive: true,
};

export default function TablesPage() {
  const { toast } = useToast();
  const { user: currentUser } = useSession();
  const canManageTables = currentUser.permissions.includes("tables.manage");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TableEditFields | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const { data, error, isLoading, refetch } = useTablesQuery({
    search,
    status,
    page,
    pageSize: 10,
  });
  const detailQuery = useTableQuery(detailId, { enabled: detailId !== null });
  const createTable = useCreateTableMutation();
  const updateTable = useUpdateTableMutation();
  const regenerateQr = useRegenerateTableQrMutation();
  const detail = detailQuery.data ?? null;

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<TableValues>({
    defaultValues: emptyTable,
    resolver: zodResolver(tableSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ ...emptyTable });
    setFormOpen(true);
  };

  const openEdit = (table: TableEditFields) => {
    setEditing(table);
    reset({
      name: table.name,
      status: table.status,
      isActive: table.isActive,
    });
    setDetailId(null);
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateTable.mutateAsync({ id: editing.id, input: values });
        toast({ title: "Meja diperbarui", tone: "success" });
      } else {
        const created = await createTable.mutateAsync(values);
        setDetailId(created.id);
        toast({ title: "Meja ditambahkan", tone: "success" });
      }
      setFormOpen(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Meja gagal disimpan.",
      });
    }
  });

  const columns: ColumnDef<TableSummary>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) => (
        <button
          className="min-h-11 text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          onClick={() => setDetailId(row.original.id)}
          type="button"
        >
          {row.original.name}
        </button>
      ),
      header: "Nama meja",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge tone={statusTones[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
      header: "Status",
    },
    {
      accessorKey: "isActive",
      cell: ({ row }) => (
        <Badge tone={row.original.isActive ? "success" : "neutral"}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
      header: "Aktif",
    },
    {
      accessorKey: "activeOrderCount",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.activeOrderCount}</span>
      ),
      header: "Pesanan aktif",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
    {
      cell: ({ row }) => {
        const table = row.original;

        return (
          <TableActions
            actions={[
              {
                icon: Eye,
                label: `Detail ${table.name}`,
                onClick: () => setDetailId(table.id),
              },
              ...(canManageTables
                ? [
                    {
                      icon: Pencil,
                      label: `Ubah ${table.name}`,
                      onClick: () => openEdit(table),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
      header: "Aksi",
      id: "actions",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
  ];

  return (
    <RequirePermission permission="tables.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="tables.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah meja
              </Button>
            </PermissionGate>
          }
          description="Kelola meja dan pratinjau QR."
          title="Meja"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <Select
                  aria-label="Filter status meja"
                  className="w-40"
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  value={status}
                >
                  <option value="all">Semua status</option>
                  <option value="AVAILABLE">Tersedia</option>
                  <option value="OCCUPIED">Terisi</option>
                  <option value="INACTIVE">Nonaktif</option>
                </Select>
              }
              hasActiveFilters={search !== "" || status !== "all"}
              onReset={() => {
                setSearch("");
                setStatus("all");
                setPage(1);
              }}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nama meja"
            />

            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : error ? (
              <ErrorState onRetry={() => void refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="tables.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah meja pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada meja pada filter ini. Tambah meja untuk mulai."
                icon={Armchair}
                title="Belum ada meja"
              />
            ) : (
              <ResponsiveList
                cards={
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {data.items.map((table) => (
                      <button
                        className="flex min-h-11 flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                        key={table.id}
                        onClick={() => setDetailId(table.id)}
                        type="button"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-body font-medium text-foreground">
                            {table.name}
                          </span>
                          <Badge tone={statusTones[table.status]}>
                            {statusLabels[table.status]}
                          </Badge>
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {table.isActive ? "Aktif" : "Nonaktif"},{" "}
                          {table.activeOrderCount} pesanan aktif
                        </span>
                      </button>
                    ))}
                  </div>
                }
                table={
                  <DataTable
                    columns={columns}
                    data={data.items}
                    getRowId={(table) => table.id}
                  />
                }
              />
            )}
          </CardContent>
          {data && data.total > 0 ? (
            <TablePagination
              onPageChange={setPage}
              page={data.page}
              pageCount={data.pageCount}
              pageSize={data.pageSize}
              total={data.total}
            />
          ) : null}
        </Card>

        <FormDrawer
          description={
            editing
              ? "Ubah informasi meja dan status operasional."
              : "Tambahkan meja baru untuk operasional."
          }
          formId="table-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah meja" : "Tambah meja"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="table-name"
            label="Nama atau nomor meja"
            required
          >
            <Input id="table-name" {...register("name")} />
          </Field>
          <Field
            error={errors.status?.message}
            htmlFor="table-status"
            label="Status"
            required
          >
            <Select id="table-status" {...register("status")}>
              <option value="AVAILABLE">Tersedia</option>
              <option value="OCCUPIED">Terisi</option>
              <option value="INACTIVE">Nonaktif</option>
            </Select>
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-foreground"
            htmlFor="table-active"
          >
            <Checkbox id="table-active" {...register("isActive")} />
            Meja aktif
          </label>
          {errors.root?.message ? (
            <p
              className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
              role="alert"
            >
              {errors.root.message}
            </p>
          ) : null}
        </FormDrawer>

        <Drawer
          description="Informasi meja dan pratinjau QR ordering."
          onOpenChange={(open) => {
            if (!open) {
              setDetailId(null);
            }
          }}
          open={detailId !== null}
          title={detail?.name ?? "Detail meja"}
        >
          {detailQuery.error ? (
            <ErrorState onRetry={() => void detailQuery.refetch()} />
          ) : detail ? (
            <div className="flex flex-col gap-4">
              <dl className="grid gap-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge tone={statusTones[detail.status]}>
                      {statusLabels[detail.status]}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Aktif</dt>
                  <dd>{detail.isActive ? "Ya" : "Tidak"}</dd>
                </div>
              </dl>
              <TableQrCode label={detail.name} token={detail.qrToken} />
              <PermissionGate permission="tables.manage">
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button onClick={() => openEdit(detail)} variant="outline">
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                    Ubah meja
                  </Button>
                  <Button
                    onClick={() => setRegenerateOpen(true)}
                    variant="outline"
                  >
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Buat ulang token
                  </Button>
                </div>
              </PermissionGate>
            </div>
          ) : (
            <p className="text-body text-muted-foreground">
              Memuat detail meja.
            </p>
          )}
        </Drawer>

        <ConfirmDialog
          confirmLabel="Ya, buat ulang"
          description="Token lama tidak berlaku lagi. QR yang sudah dicetak harus diganti."
          isLoading={regenerateQr.isPending}
          onConfirm={async () => {
            if (!detailId) {
              return;
            }
            try {
              await regenerateQr.mutateAsync(detailId);
              setRegenerateOpen(false);
              toast({ title: "Token meja diperbarui", tone: "success" });
            } catch (reason) {
              toast({
                title: "Token gagal diperbarui",
                description:
                  reason instanceof Error ? reason.message : "Coba lagi.",
                tone: "danger",
              });
            }
          }}
          onOpenChange={setRegenerateOpen}
          open={regenerateOpen}
          title="Buat ulang token QR?"
        />
      </div>
    </RequirePermission>
  );
}
