"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Store } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { useAsyncData } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Outlet } from "@/types/auth";

const outletSchema = z.object({
  name: z.string().min(1, "Nama outlet wajib diisi."),
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter.")
    .max(10, "Kode maksimal 10 karakter."),
  city: z.string().min(1, "Kota wajib diisi."),
  address: z.string(),
  isActive: z.boolean(),
});

type OutletValues = z.infer<typeof outletSchema>;

const emptyOutlet: OutletValues = {
  name: "",
  code: "",
  city: "",
  address: "",
  isActive: true,
};

export default function OutletsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Outlet | null>(null);

  const { data, error, isLoading, refresh } = useAsyncData(
    () =>
      managementService.listOutlets({
        search,
        active,
        page,
        pageSize: 10,
      }),
    JSON.stringify([search, active, page]),
  );

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<OutletValues>({
    defaultValues: emptyOutlet,
    resolver: zodResolver(outletSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset(emptyOutlet);
    setFormOpen(true);
  };

  const openEdit = (outlet: Outlet) => {
    setEditing(outlet);
    reset({
      name: outlet.name,
      code: outlet.code,
      city: outlet.city,
      address: outlet.address ?? "",
      isActive: outlet.isActive !== false,
    });
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await managementService.updateOutlet(editing.id, values);
        toast({ title: "Outlet diperbarui", tone: "success" });
      } else {
        await managementService.createOutlet(values);
        toast({ title: "Outlet ditambahkan", tone: "success" });
      }
      setFormOpen(false);
      refresh();
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Outlet gagal disimpan.",
      });
    }
  });

  const toggleActive = async (outlet: Outlet) => {
    try {
      await managementService.setOutletActive(
        outlet.id,
        outlet.isActive === false,
      );
      toast({
        title:
          outlet.isActive === false
            ? "Outlet diaktifkan"
            : "Outlet dinonaktifkan",
        tone: "success",
      });
      refresh();
    } catch (reason) {
      toast({
        title: "Status outlet gagal diubah",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  return (
    <RequirePermission permission="outlets.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <>
              <Badge tone="neutral">Data simulasi</Badge>
              <PermissionGate permission="outlets.manage">
                <Button onClick={openCreate}>
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Tambah outlet
                </Button>
              </PermissionGate>
            </>
          }
          description="Kelola lokasi operasional. Outlet dengan pesanan dinonaktifkan, bukan dihapus."
          title="Outlet"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <Select
                  aria-label="Filter status outlet"
                  className="w-40"
                  onChange={(event) => {
                    setActive(event.target.value);
                    setPage(1);
                  }}
                  value={active}
                >
                  <option value="all">Semua status</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </Select>
              }
              hasActiveFilters={search !== "" || active !== "all"}
              onReset={() => {
                setSearch("");
                setActive("all");
                setPage(1);
              }}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nama atau kode outlet"
            />

            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : error ? (
              <ErrorState onRetry={refresh} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="outlets.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah outlet pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada outlet pada filter ini."
                icon={Store}
                title="Belum ada outlet"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((outlet) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={outlet.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {outlet.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {outlet.code}. {outlet.city}
                        </span>
                      </div>
                      <Badge
                        tone={outlet.isActive === false ? "neutral" : "success"}
                      >
                        {outlet.isActive === false ? "Nonaktif" : "Aktif"}
                      </Badge>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {outlet.address || "Alamat belum diisi"}
                    </span>
                    <PermissionGate permission="outlets.manage">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          onClick={() => openEdit(outlet)}
                          size="sm"
                          variant="outline"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                          Ubah
                        </Button>
                        <Button
                          onClick={() => toggleActive(outlet)}
                          size="sm"
                          variant="ghost"
                        >
                          {outlet.isActive === false
                            ? "Aktifkan"
                            : "Nonaktifkan"}
                        </Button>
                      </div>
                    </PermissionGate>
                  </div>
                ))}
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Kota</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((outlet) => (
                        <TableRow key={outlet.id}>
                          <TableCell className="font-medium">
                            {outlet.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {outlet.code}
                          </TableCell>
                          <TableCell>{outlet.city}</TableCell>
                          <TableCell className="max-w-56 truncate text-muted-foreground">
                            {outlet.address || "Tidak ada"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={
                                outlet.isActive === false
                                  ? "neutral"
                                  : "success"
                              }
                            >
                              {outlet.isActive === false ? "Nonaktif" : "Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <PermissionGate permission="outlets.manage">
                              <div className="flex justify-end gap-1">
                                <Button
                                  aria-label={`Ubah ${outlet.name}`}
                                  onClick={() => openEdit(outlet)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pencil
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Button
                                  onClick={() => toggleActive(outlet)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  {outlet.isActive === false
                                    ? "Aktifkan"
                                    : "Nonaktifkan"}
                                </Button>
                              </div>
                            </PermissionGate>
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
              ? "Ubah informasi outlet."
              : "Tambahkan outlet baru untuk operasional."
          }
          formId="outlet-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah outlet" : "Tambah outlet"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="outlet-name"
            label="Nama outlet"
            required
          >
            <Input id="outlet-name" {...register("name")} />
          </Field>
          <Field
            error={errors.code?.message}
            htmlFor="outlet-code"
            label="Kode"
            required
          >
            <Input id="outlet-code" {...register("code")} />
          </Field>
          <Field
            error={errors.city?.message}
            htmlFor="outlet-city"
            label="Kota"
            required
          >
            <Input id="outlet-city" {...register("city")} />
          </Field>
          <Field
            error={errors.address?.message}
            htmlFor="outlet-address"
            label="Alamat"
          >
            <Textarea id="outlet-address" {...register("address")} />
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-foreground"
            htmlFor="outlet-active"
          >
            <Checkbox id="outlet-active" {...register("isActive")} />
            Outlet aktif
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
      </div>
    </RequirePermission>
  );
}
