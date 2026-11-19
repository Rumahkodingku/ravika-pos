"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Tag } from "lucide-react";
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
import { useToast } from "@/components/ui/toast";
import {
  useAddOnsQuery,
  useCreateAddOnMutation,
  useSetAddOnActiveMutation,
  useUpdateAddOnMutation,
} from "@/features/management/api/catalog";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { formatCurrency, parseCurrencyInput } from "@/lib/format";
import type { AddOn } from "@/types/domain";

const addOnSchema = z.object({
  name: z.string().min(1, "Nama add-on wajib diisi."),
  price: z.number().int().min(0, "Harga minimal 0."),
  isActive: z.boolean(),
});

type AddOnValues = z.infer<typeof addOnSchema>;

const emptyAddOn: AddOnValues = {
  name: "",
  price: 0,
  isActive: true,
};

export default function AddOnsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AddOn | null>(null);

  const { data, error, isLoading, refetch } = useAddOnsQuery();
  const createAddOn = useCreateAddOnMutation();
  const updateAddOn = useUpdateAddOnMutation();
  const setAddOnActive = useSetAddOnActiveMutation();

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<AddOnValues>({
    defaultValues: emptyAddOn,
    resolver: zodResolver(addOnSchema),
  });

  const filtered = (data ?? [])
    .filter(
      (addOn) =>
        addOn.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        (active === "all" || String(addOn.isActive) === active),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  const pageSize = 10;
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const items = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openCreate = () => {
    setEditing(null);
    reset(emptyAddOn);
    setFormOpen(true);
  };

  const openEdit = (addOn: AddOn) => {
    setEditing(addOn);
    reset({
      name: addOn.name,
      price: addOn.price,
      isActive: addOn.isActive,
    });
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateAddOn.mutateAsync({ id: editing.id, input: values });
        toast({ title: "Add-on diperbarui", tone: "success" });
      } else {
        await createAddOn.mutateAsync(values);
        toast({ title: "Add-on ditambahkan", tone: "success" });
      }
      setFormOpen(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Add-on gagal disimpan.",
      });
    }
  });

  const toggleActive = async (addOn: AddOn) => {
    try {
      await setAddOnActive.mutateAsync({
        addOn,
        isActive: !addOn.isActive,
      });
      toast({
        title: addOn.isActive ? "Add-on dinonaktifkan" : "Add-on diaktifkan",
        tone: "success",
      });
    } catch (reason) {
      toast({
        title: "Status gagal diubah",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  return (
    <RequirePermission permission="products.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="products.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah add-on
              </Button>
            </PermissionGate>
          }
          description="Kelola add-on atau topping yang dapat dipilih pada produk."
          title="Add-on"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <Select
                  aria-label="Filter status add-on"
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
              resultCount={total}
              search={search}
              searchPlaceholder="Cari nama add-on"
            />

            {isLoading ? (
              <TableSkeleton columns={4} />
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="products.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah add-on pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada add-on pada filter ini."
                icon={Tag}
                title="Belum ada add-on"
              />
            ) : (
              <ResponsiveList
                cards={items.map((addOn) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={addOn.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {addOn.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {formatCurrency(addOn.price)}
                        </span>
                      </div>
                      <Badge tone={addOn.isActive ? "success" : "neutral"}>
                        {addOn.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <PermissionGate permission="products.manage">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => openEdit(addOn)}
                          size="sm"
                          variant="outline"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                          Ubah
                        </Button>
                        <Button
                          onClick={() => void toggleActive(addOn)}
                          size="sm"
                          variant="ghost"
                        >
                          {addOn.isActive ? "Nonaktifkan" : "Aktifkan"}
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
                        <TableHead>Harga</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((addOn) => (
                        <TableRow key={addOn.id}>
                          <TableCell className="font-medium">
                            {addOn.name}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {formatCurrency(addOn.price)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={addOn.isActive ? "success" : "neutral"}
                            >
                              {addOn.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <PermissionGate permission="products.manage">
                              <div className="flex justify-end gap-1">
                                <Button
                                  onClick={() => openEdit(addOn)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pencil
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Button
                                  onClick={() => void toggleActive(addOn)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  {addOn.isActive ? "Nonaktifkan" : "Aktifkan"}
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
        </Card>

        {total > pageSize ? (
          <TablePagination
            onPageChange={setPage}
            page={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            total={total}
          />
        ) : null}

        <FormDrawer
          description="Add-on digunakan sebagai pilihan pada produk."
          formId="addon-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah add-on" : "Tambah add-on"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="addon-name"
            label="Nama add-on"
            required
          >
            <Input id="addon-name" {...register("name")} />
          </Field>
          <Field
            error={errors.price?.message}
            htmlFor="addon-price"
            label="Harga"
            required
          >
            <Input
              id="addon-price"
              inputMode="numeric"
              type="text"
              {...register("price", { setValueAs: parseCurrencyInput })}
            />
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-foreground"
            htmlFor="addon-active"
          >
            <Checkbox id="addon-active" {...register("isActive")} />
            Add-on aktif
          </label>
          {errors.root?.message ? (
            <p
              className="rounded-md border border-danger/20 bg-surface-subtle px-3 py-2 text-body text-danger-strong"
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
