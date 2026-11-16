"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Armchair, Pencil, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useMockSession } from "@/features/auth/mock-session";
import { ConfirmDialog } from "@/features/management/confirm-dialog";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableQrCode } from "@/features/management/table-qr-code";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { DiningTable, TableStatus } from "@/types/domain";

const tableSchema = z.object({
  name: z.string().min(1, "Nama meja wajib diisi."),
  outletId: z.string().min(1, "Outlet wajib dipilih."),
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

const emptyTable: TableValues = {
  name: "",
  outletId: "",
  status: "AVAILABLE",
  isActive: true,
};

export default function TablesPage() {
  const { toast } = useToast();
  const { user } = useMockSession();
  const allOutlets = useManagementStore((state) => state.outlets);
  const outlets = allOutlets.filter((outlet) =>
    user?.outletIds.includes(outlet.id),
  );
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiningTable | null>(null);
  const [detail, setDetail] = useState<DiningTable | null>(null);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { data, error, isLoading, refresh } = useAsyncData(
    () =>
      managementService.listTables({
        search,
        outletId,
        status,
        page,
        pageSize: 10,
      }),
    JSON.stringify([search, outletId, status, page]),
  );

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

  const outletName = (id: string) =>
    outlets.find((outlet) => outlet.id === id)?.name ??
    "Outlet tidak ditemukan";

  const openCreate = () => {
    setEditing(null);
    reset({ ...emptyTable, outletId: outlets[0]?.id ?? "" });
    setFormOpen(true);
  };

  const openEdit = (table: DiningTable) => {
    setEditing(table);
    reset({
      name: table.name,
      outletId: table.outletId,
      status: table.status,
      isActive: table.isActive,
    });
    setDetail(null);
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await managementService.updateTable(editing.id, values);
        toast({ title: "Meja diperbarui", tone: "success" });
      } else {
        await managementService.createTable(values);
        toast({ title: "Meja ditambahkan", tone: "success" });
      }
      setFormOpen(false);
      refresh();
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Meja gagal disimpan.",
      });
    }
  });

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
          description="Kelola meja per outlet dan pratinjau QR. Data simulasi."
          title="Meja"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <>
                  <Select
                    aria-label="Filter outlet"
                    className="w-48"
                    onChange={(event) => {
                      setOutletId(event.target.value);
                      setPage(1);
                    }}
                    value={outletId}
                  >
                    <option value="all">Semua outlet</option>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </Select>
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
                </>
              }
              hasActiveFilters={
                search !== "" || outletId !== "all" || status !== "all"
              }
              onReset={() => {
                setSearch("");
                setOutletId("all");
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
              <ErrorState onRetry={refresh} />
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
                        onClick={() => setDetail(table)}
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
                          {outletName(table.outletId)}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {table.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </button>
                    ))}
                  </div>
                }
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama meja</TableHead>
                        <TableHead>Outlet</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktif</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((table) => (
                        <TableRow key={table.id}>
                          <TableCell>
                            <button
                              className="min-h-11 text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                              onClick={() => setDetail(table)}
                              type="button"
                            >
                              {table.name}
                            </button>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {outletName(table.outletId)}
                          </TableCell>
                          <TableCell>
                            <Badge tone={statusTones[table.status]}>
                              {statusLabels[table.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={table.isActive ? "success" : "neutral"}
                            >
                              {table.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() => setDetail(table)}
                                size="sm"
                                variant="ghost"
                              >
                                Detail
                              </Button>
                              <PermissionGate permission="tables.manage">
                                <Button
                                  aria-label={`Ubah ${table.name}`}
                                  onClick={() => openEdit(table)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pencil
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              : "Tambahkan meja baru untuk outlet."
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
            error={errors.outletId?.message}
            htmlFor="table-outlet"
            label="Outlet"
            required
          >
            <Select id="table-outlet" {...register("outletId")}>
              <option value="">Pilih outlet</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </Select>
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
              setDetail(null);
            }
          }}
          open={detail !== null}
          title={detail?.name ?? "Detail meja"}
        >
          {detail ? (
            <div className="flex flex-col gap-4">
              <dl className="grid gap-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Outlet</dt>
                  <dd>{outletName(detail.outletId)}</dd>
                </div>
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
          ) : null}
        </Drawer>

        <ConfirmDialog
          confirmLabel="Buat ulang token"
          description="Token lama tidak berlaku lagi. QR yang sudah dicetak harus diganti."
          isLoading={isRegenerating}
          onConfirm={async () => {
            if (!detail) {
              return;
            }
            setIsRegenerating(true);
            try {
              const token = await managementService.regenerateTableToken(
                detail.id,
              );
              setDetail({ ...detail, qrToken: token });
              setRegenerateOpen(false);
              toast({ title: "Token meja diperbarui", tone: "success" });
              refresh();
            } catch (reason) {
              toast({
                title: "Token gagal diperbarui",
                description:
                  reason instanceof Error ? reason.message : "Coba lagi.",
                tone: "danger",
              });
            } finally {
              setIsRegenerating(false);
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
