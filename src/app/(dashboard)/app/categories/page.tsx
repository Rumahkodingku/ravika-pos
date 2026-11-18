"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Pencil, Plus, Tags } from "lucide-react";
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
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useMoveCategoryMutation,
  useProductsQuery,
  useSetCategoryActiveMutation,
  useUpdateCategoryMutation,
} from "@/features/management/api/catalog";
import { ConfirmDialog } from "@/features/management/confirm-dialog";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import type { Category } from "@/types/domain";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi."),
  description: z.string(),
  sortOrder: z.number().int().min(0, "Urutan minimal 0."),
  isActive: z.boolean(),
});

type CategoryValues = z.infer<typeof categorySchema>;

const emptyCategory: CategoryValues = {
  name: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { data, error, isLoading, refetch } = useCategoriesQuery({
    search,
    active,
    page,
    pageSize: 10,
  });
  const { data: productData } = useProductsQuery({ pageSize: 200 });
  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const moveCategory = useMoveCategoryMutation();
  const setCategoryActive = useSetCategoryActiveMutation();
  const products = productData?.items ?? [];

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CategoryValues>({
    defaultValues: emptyCategory,
    resolver: zodResolver(categorySchema),
  });

  const productCount = (categoryId: string) =>
    products.filter((product) => product.categoryId === categoryId).length;

  const openCreate = () => {
    setEditing(null);
    reset(emptyCategory);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    reset({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, input: values });
        toast({ title: "Kategori diperbarui", tone: "success" });
      } else {
        await createCategory.mutateAsync(values);
        toast({ title: "Kategori ditambahkan", tone: "success" });
      }
      setFormOpen(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Kategori gagal disimpan.",
      });
    }
  });

  const move = async (category: Category, direction: "up" | "down") => {
    try {
      await moveCategory.mutateAsync({ id: category.id, direction });
    } catch (reason) {
      toast({
        title: "Urutan gagal diubah",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  const toggleActive = async (category: Category) => {
    if (category.isActive && productCount(category.id) > 0) {
      setConfirmTarget(category);
      return;
    }

    try {
      await setCategoryActive.mutateAsync({
        category,
        isActive: !category.isActive,
      });
      toast({
        title: category.isActive
          ? "Kategori dinonaktifkan"
          : "Kategori diaktifkan",
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
    <RequirePermission permission="categories.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="categories.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah kategori
              </Button>
            </PermissionGate>
          }
          description="Susun kategori untuk katalog dan menu pelanggan."
          title="Kategori"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <Select
                  aria-label="Filter status kategori"
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
              searchPlaceholder="Cari kategori"
            />

            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : error ? (
              <ErrorState onRetry={() => void refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="categories.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah kategori pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada kategori pada filter ini. Tambah kategori untuk mulai."
                icon={Tags}
                title="Belum ada kategori"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((category) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={category.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {category.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          Urutan {category.sortOrder}
                        </span>
                      </div>
                      <Badge tone={category.isActive ? "success" : "neutral"}>
                        {category.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {productCount(category.id)} produk
                    </span>
                    <PermissionGate permission="categories.manage">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          onClick={() => move(category, "up")}
                          size="sm"
                          variant="ghost"
                        >
                          <ArrowUp aria-hidden="true" className="h-4 w-4" />
                          Naik
                        </Button>
                        <Button
                          onClick={() => move(category, "down")}
                          size="sm"
                          variant="ghost"
                        >
                          <ArrowDown aria-hidden="true" className="h-4 w-4" />
                          Turun
                        </Button>
                        <Button
                          onClick={() => openEdit(category)}
                          size="sm"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                          Ubah
                        </Button>
                        <Button
                          onClick={() => toggleActive(category)}
                          size="sm"
                          variant="ghost"
                        >
                          {category.isActive ? "Nonaktifkan" : "Aktifkan"}
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
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Urutan</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell className="max-w-56 truncate text-muted-foreground">
                            {category.description || "Tidak ada"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {category.sortOrder}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {productCount(category.id)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={category.isActive ? "success" : "neutral"}
                            >
                              {category.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <PermissionGate permission="categories.manage">
                                <Button
                                  aria-label={`Naikkan ${category.name}`}
                                  onClick={() => move(category, "up")}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <ArrowUp
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Button
                                  aria-label={`Turunkan ${category.name}`}
                                  onClick={() => move(category, "down")}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <ArrowDown
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Button
                                  aria-label={`Ubah ${category.name}`}
                                  onClick={() => openEdit(category)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Pencil
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                </Button>
                                <Button
                                  onClick={() => toggleActive(category)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  {category.isActive
                                    ? "Nonaktifkan"
                                    : "Aktifkan"}
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
              ? "Ubah informasi kategori."
              : "Tambahkan kategori baru untuk katalog."
          }
          formId="category-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah kategori" : "Tambah kategori"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="category-name"
            label="Nama kategori"
            required
          >
            <Input id="category-name" {...register("name")} />
          </Field>
          <Field
            error={errors.description?.message}
            htmlFor="category-description"
            label="Deskripsi"
          >
            <Textarea id="category-description" {...register("description")} />
          </Field>
          <Field
            error={errors.sortOrder?.message}
            htmlFor="category-order"
            label="Urutan"
            required
          >
            <Input
              id="category-order"
              min={0}
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-foreground"
            htmlFor="category-active"
          >
            <Checkbox id="category-active" {...register("isActive")} />
            Kategori aktif
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

        <ConfirmDialog
          confirmLabel="Nonaktifkan kategori"
          description={
            confirmTarget
              ? `${confirmTarget.name} masih dipakai oleh ${productCount(confirmTarget.id)} produk. Produk tetap ada, tetapi kategori ini tidak tampil sebagai aktif.`
              : ""
          }
          isLoading={isConfirming}
          onConfirm={async () => {
            if (!confirmTarget) {
              return;
            }
            setIsConfirming(true);
            try {
              await setCategoryActive.mutateAsync({
                category: confirmTarget,
                isActive: false,
              });
              toast({ title: "Kategori dinonaktifkan", tone: "success" });
              setConfirmTarget(null);
            } catch (reason) {
              toast({
                title: "Status gagal diubah",
                description:
                  reason instanceof Error ? reason.message : "Coba lagi.",
                tone: "danger",
              });
            } finally {
              setIsConfirming(false);
            }
          }}
          onOpenChange={(open) => {
            if (!open) {
              setConfirmTarget(null);
            }
          }}
          open={confirmTarget !== null}
          title="Nonaktifkan kategori?"
        />
      </div>
    </RequirePermission>
  );
}
