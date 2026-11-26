"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  ColumnDef,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { Eye, Package, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
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
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { ProductImage } from "@/components/ui/product-image";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/auth/session-provider";
import {
  type ProductInput,
  useAddOnsQuery,
  useCategoriesQuery,
  useCreateProductMutation,
  useDeleteProductImageMutation,
  useProductsQuery,
  useSetProductFlagsMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "@/features/management/api/catalog";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { productPriceDisplay } from "@/lib/catalog-pricing";
import { formatCurrency, parseCurrencyInput } from "@/lib/format";
import { compressProductImage, PRODUCT_IMAGE_ACCEPT } from "@/lib/image";
import type { Product } from "@/types/domain";

const hasPriceDigits = (value: string) => /\d/.test(value);

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama varian wajib diisi."),
  price: z.string().refine(hasPriceDigits, "Masukkan harga untuk varian ini."),
  isActive: z.boolean(),
});

const productAddOnSchema = z.object({
  addOnId: z.string().min(1, "Pilih add-on."),
  isRequired: z.boolean(),
  minSelection: z.number().int().min(0),
  maxSelection: z.number().int().min(1, "Maksimal pilihan minimal 1."),
});

const productSchema = z
  .object({
    name: z.string().min(1, "Nama produk wajib diisi."),
    description: z.string(),
    categoryId: z.string().min(1, "Kategori wajib dipilih."),
    basePrice: z.string(),
    isAvailable: z.boolean(),
    isActive: z.boolean(),
    variants: z.array(variantSchema),
    addOns: z.array(productAddOnSchema),
  })
  .superRefine((value, context) => {
    if (value.variants.length === 0 && !hasPriceDigits(value.basePrice)) {
      context.addIssue({
        code: "custom",
        message: "Harga dasar wajib diisi.",
        path: ["basePrice"],
      });
    }
  });

type ProductValues = z.infer<typeof productSchema>;

const emptyProduct: ProductValues = {
  name: "",
  description: "",
  categoryId: "",
  basePrice: "",
  isAvailable: true,
  isActive: true,
  variants: [],
  addOns: [],
};

function toValues(product: Product): ProductValues {
  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice === null ? "" : String(product.basePrice),
    isAvailable: product.isAvailable,
    isActive: product.isActive,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: String(variant.price),
      isActive: variant.isActive,
    })),
    addOns: product.addOns,
  };
}

export default function ProductsPage() {
  const { toast } = useToast();
  const { user: currentUser } = useSession();
  const canManageProducts = currentUser.permissions.includes("products.manage");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [active, setActive] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  const { data, error, isLoading, refetch } = useProductsQuery({
    search,
    categoryId,
    active,
    availability,
    sortBy,
    sortDir,
    page,
    pageSize: 10,
  });
  const { data: categoryData } = useCategoriesQuery({ pageSize: 200 });
  const { data: addOnData = [] } = useAddOnsQuery();
  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const setProductFlags = useSetProductFlagsMutation();
  const uploadProductImage = useUploadProductImageMutation();
  const deleteProductImage = useDeleteProductImageMutation();
  const categories = categoryData?.items ?? [];
  const addOns = addOnData;
  const activeAddOns = addOns.filter((addOn) => addOn.isActive);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProductValues>({
    defaultValues: emptyProduct,
    resolver: zodResolver(productSchema),
  });
  const variantFields = useFieldArray({ control, name: "variants" });
  const addOnFields = useFieldArray({ control, name: "addOns" });
  const watchedVariants = useWatch({ control, name: "variants" });
  const hasVariants = (watchedVariants ?? []).length > 0;

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const openCreate = () => {
    setEditing(null);
    setImageBlob(null);
    setImagePreview(null);
    setRemoveImage(false);
    reset({ ...emptyProduct, categoryId: categories[0]?.id ?? "" });
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setImageBlob(null);
    setImagePreview(product.imageUrl);
    setRemoveImage(false);
    reset(toValues(product));
    setDetail(null);
    setFormOpen(true);
  };

  const onImageChange = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setIsImageProcessing(true);

    try {
      const blob = await compressProductImage(file);
      setImageBlob(blob);
      setImagePreview(URL.createObjectURL(blob));
      setRemoveImage(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Gambar gagal diproses.",
      });
    } finally {
      setIsImageProcessing(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const input: ProductInput = {
      ...values,
      basePrice:
        values.variants.length > 0
          ? null
          : parseCurrencyInput(values.basePrice),
      variants: values.variants.map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),
        name: variant.name,
        price: parseCurrencyInput(variant.price),
        isActive: variant.isActive,
      })),
    };

    try {
      const saved = editing
        ? await updateProduct.mutateAsync({ id: editing.id, input })
        : await createProduct.mutateAsync(input);
      let imageWarning: string | null = null;

      if (imageBlob) {
        try {
          await uploadProductImage.mutateAsync({
            id: saved.id,
            image: imageBlob,
          });
        } catch {
          imageWarning =
            "Produk tersimpan tanpa gambar. Buka edit untuk mencoba lagi.";
        }
      } else if (editing && removeImage) {
        try {
          await deleteProductImage.mutateAsync(editing.id);
        } catch {
          imageWarning = "Produk tersimpan, tetapi gambar lama gagal dihapus.";
        }
      }

      toast({
        title: editing ? "Produk diperbarui" : "Produk ditambahkan",
        description: imageWarning ?? undefined,
        tone: imageWarning ? "warning" : "success",
      });
      setFormOpen(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Produk gagal disimpan.",
      });
    }
  });

  const toggleFlags = async (
    product: Product,
    flags: { isAvailable?: boolean; isActive?: boolean },
  ) => {
    try {
      await setProductFlags.mutateAsync({ flags, id: product.id });
      toast({ title: "Produk diperbarui", tone: "success" });
    } catch (reason) {
      toast({
        title: "Produk gagal diperbarui",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setActive("all");
    setAvailability("all");
    setPage(1);
  };

  const categoryName = (id: string) =>
    categories.find((category) => category.id === id)?.name ?? "Tanpa kategori";

  const availabilityState = (product: Product) => {
    if (
      product.variants.length > 0 &&
      !product.variants.some((variant) => variant.isActive)
    ) {
      return { label: "Tidak tersedia", tone: "warning" as const };
    }

    return product.isAvailable
      ? { label: "Tersedia", tone: "info" as const }
      : { label: "Habis", tone: "warning" as const };
  };

  const priceLabel = (product: Product) => {
    const display = productPriceDisplay(product);

    if (display.kind === "unavailable") {
      return "Tidak tersedia";
    }

    return display.kind === "from"
      ? `Mulai dari ${formatCurrency(display.amount)}`
      : formatCurrency(display.amount);
  };

  const sorting: SortingState = [{ desc: sortDir === "desc", id: sortBy }];
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];

    setSortBy(first?.id ?? "name");
    setSortDir(first?.desc ? "desc" : "asc");
    setPage(1);
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-subtle">
              <ProductImage
                iconClassName="h-5 w-5"
                name={product.name}
                src={product.imageUrl}
              />
            </span>
            <button
              className="min-h-11 text-left font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              onClick={() => setDetail(product)}
              type="button"
            >
              {product.name}
            </button>
          </div>
        );
      },
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nama" />
      ),
    },
    {
      accessorFn: (row) => categoryName(row.categoryId),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {categoryName(row.original.categoryId)}
        </span>
      ),
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategori" />
      ),
      id: "category",
    },
    {
      accessorFn: (row) => {
        const display = productPriceDisplay(row);

        return display.kind === "unavailable" ? null : display.amount;
      },
      cell: ({ row }) => {
        const display = productPriceDisplay(row.original);

        return (
          <span className="tabular-nums">
            {display.kind === "unavailable"
              ? "Tidak tersedia"
              : display.kind === "from"
                ? `Mulai dari ${formatCurrency(display.amount)}`
                : formatCurrency(display.amount)}
          </span>
        );
      },
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Harga" />
      ),
      id: "price",
    },
    {
      accessorKey: "isAvailable",
      cell: ({ row }) => {
        const state = availabilityState(row.original);

        return <Badge tone={state.tone}>{state.label}</Badge>;
      },
      header: "Ketersediaan",
    },
    {
      accessorKey: "isActive",
      cell: ({ row }) => (
        <Badge tone={row.original.isActive ? "success" : "neutral"}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
      header: "Status",
    },
    {
      cell: ({ row }) => {
        const product = row.original;
        const actions = [
          {
            icon: Eye,
            label: `Lihat ${product.name}`,
            onClick: () => setDetail(product),
          },
          ...(canManageProducts
            ? [
                {
                  icon: Package,
                  label: product.isAvailable
                    ? `Tandai ${product.name} habis`
                    : `Tandai ${product.name} tersedia`,
                  onClick: () =>
                    void toggleFlags(product, {
                      isAvailable: !product.isAvailable,
                    }),
                },
                {
                  icon: Power,
                  label: product.isActive
                    ? `Nonaktifkan ${product.name}`
                    : `Aktifkan ${product.name}`,
                  onClick: () =>
                    void toggleFlags(product, { isActive: !product.isActive }),
                  variant: product.isActive
                    ? ("danger" as const)
                    : ("ghost" as const),
                },
                {
                  icon: Pencil,
                  label: `Ubah ${product.name}`,
                  onClick: () => openEdit(product),
                },
              ]
            : []),
        ];

        return <TableActions actions={actions} />;
      },
      header: "Aksi",
      id: "actions",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
  ];

  return (
    <RequirePermission permission="products.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="products.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah produk
              </Button>
            </PermissionGate>
          }
          description="Kelola menu, harga, varian, dan add-on."
          title="Produk"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <>
                  <Select
                    aria-label="Filter kategori"
                    className="w-40"
                    onChange={(event) => {
                      setCategoryId(event.target.value);
                      setPage(1);
                    }}
                    value={categoryId}
                  >
                    <option value="all">Semua kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    aria-label="Filter status aktif"
                    className="w-36"
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
                  <Select
                    aria-label="Filter ketersediaan"
                    className="w-40"
                    onChange={(event) => {
                      setAvailability(event.target.value);
                      setPage(1);
                    }}
                    value={availability}
                  >
                    <option value="all">Semua ketersediaan</option>
                    <option value="true">Tersedia</option>
                    <option value="false">Habis</option>
                  </Select>
                </>
              }
              hasActiveFilters={
                search !== "" ||
                categoryId !== "all" ||
                active !== "all" ||
                availability !== "all"
              }
              onReset={resetFilters}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nama produk"
            />

            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : error ? (
              <ErrorState onRetry={() => void refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="products.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah produk pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada produk pada filter ini. Tambah produk pertama untuk mulai."
                icon={Package}
                title="Belum ada produk"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((product) => (
                  <button
                    className="flex min-h-11 flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    key={product.id}
                    onClick={() => setDetail(product)}
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {product.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {categoryName(product.categoryId)}
                        </span>
                      </span>
                      <Badge tone={product.isActive ? "success" : "neutral"}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-body font-medium tabular-nums text-foreground">
                        {priceLabel(product)}
                      </span>
                      <Badge tone={availabilityState(product).tone}>
                        {availabilityState(product).label}
                      </Badge>
                    </span>
                  </button>
                ))}
                table={
                  <DataTable
                    columns={columns}
                    data={data.items}
                    getRowId={(product) => product.id}
                    onSortingChange={onSortingChange}
                    sorting={sorting}
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
              ? "Ubah informasi produk dan ketersediaan."
              : "Tambahkan produk baru ke katalog."
          }
          formId="product-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting || isImageProcessing}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) {
              setImageBlob(null);
              setImagePreview(null);
              setRemoveImage(false);
            }
          }}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah produk" : "Tambah produk"}
        >
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface text-muted-foreground">
                <ProductImage
                  iconClassName="h-7 w-7"
                  name={editing?.name ?? "Produk"}
                  src={imagePreview}
                />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-label font-medium text-foreground">
                  Gambar produk
                </span>
                <span className="text-caption text-muted-foreground">
                  JPEG, PNG, atau WebP. Otomatis dikompres, maksimal 5 MB.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label
                className="inline-flex min-h-9 cursor-pointer items-center rounded-md border border-border bg-surface px-3 text-label font-medium text-foreground hover:bg-muted focus-within:ring-2 focus-within:ring-focus-ring"
                htmlFor="product-image"
              >
                {imagePreview ? "Ganti gambar" : "Pilih gambar"}
              </label>
              <input
                accept={PRODUCT_IMAGE_ACCEPT}
                className="sr-only"
                id="product-image"
                onChange={(event) => {
                  void onImageChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
                type="file"
              />
              {imagePreview ? (
                <Button
                  onClick={() => {
                    setImageBlob(null);
                    setImagePreview(null);
                    setRemoveImage(Boolean(editing?.imageUrl));
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Hapus gambar
                </Button>
              ) : null}
              {isImageProcessing ? (
                <span className="self-center text-caption text-muted-foreground">
                  Memproses gambar...
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-label font-medium text-foreground">
              Informasi dasar
            </p>
            <Field
              error={errors.name?.message}
              htmlFor="product-name"
              label="Nama produk"
              required
            >
              <Input id="product-name" {...register("name")} />
            </Field>
            <Field
              error={errors.description?.message}
              htmlFor="product-description"
              label="Deskripsi"
            >
              <Textarea id="product-description" {...register("description")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                error={errors.categoryId?.message}
                htmlFor="product-category"
                label="Kategori"
                required
              >
                <Select id="product-category" {...register("categoryId")}>
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
              {hasVariants ? (
                <div className="flex items-end">
                  <p className="pb-3 text-caption text-muted-foreground">
                    Harga ditentukan oleh varian.
                  </p>
                </div>
              ) : (
                <Field
                  error={errors.basePrice?.message}
                  htmlFor="product-price"
                  label="Harga dasar"
                  required
                >
                  <Input
                    id="product-price"
                    inputMode="numeric"
                    type="text"
                    {...register("basePrice")}
                  />
                </Field>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="flex min-h-11 items-center gap-2 text-body text-foreground"
                htmlFor="product-available"
              >
                <Checkbox id="product-available" {...register("isAvailable")} />
                Tersedia untuk dijual
              </label>
              <label
                className="flex min-h-11 items-center gap-2 text-body text-foreground"
                htmlFor="product-active"
              >
                <Checkbox id="product-active" {...register("isActive")} />
                Produk aktif
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-label font-medium text-foreground">Varian</p>
                <p className="text-caption text-muted-foreground">
                  Opsional. Contoh: Regular dan Large.
                </p>
              </div>
              <Button
                onClick={() =>
                  variantFields.append({
                    name: "",
                    price: "",
                    isActive: true,
                  })
                }
                size="sm"
                variant="outline"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Varian
              </Button>
            </div>
            {variantFields.fields.map((field, index) => (
              <div
                className="grid gap-2 rounded-md border border-border p-3 "
                key={field.id}
              >
                <Field
                  error={errors.variants?.[index]?.name?.message}
                  htmlFor={`variant-name-${field.id}`}
                  label="Nama varian"
                >
                  <Input
                    id={`variant-name-${field.id}`}
                    {...register(`variants.${index}.name`)}
                  />
                </Field>
                <Field
                  error={errors.variants?.[index]?.price?.message}
                  htmlFor={`variant-price-${field.id}`}
                  label="Harga"
                  required
                >
                  <Input
                    id={`variant-price-${field.id}`}
                    inputMode="numeric"
                    type="text"
                    {...register(`variants.${index}.price`)}
                  />
                </Field>
                <div className="flex items-end gap-2">
                  <label
                    className="flex min-h-11 items-center gap-2 text-caption text-foreground"
                    htmlFor={`variant-active-${field.id}`}
                  >
                    <Checkbox
                      id={`variant-active-${field.id}`}
                      {...register(`variants.${index}.isActive`)}
                    />
                    Aktif
                  </label>
                </div>
                <Button
                  aria-label="Hapus varian"
                  onClick={() => variantFields.remove(index)}
                  size="lg"
                  variant="danger"
                  className="w-full"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" /> Hapus
                  Variant
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <p className="text-label font-medium text-foreground">
                  Add-on produk
                </p>
                <p className="text-caption text-muted-foreground">
                  Pilih add-on katalog dan atur batas pilihan.
                </p>
              </div>
              <Button
                onClick={() =>
                  addOnFields.append({
                    addOnId: addOns[0]?.id ?? "",
                    isRequired: false,
                    minSelection: 0,
                    maxSelection: 1,
                  })
                }
                size="sm"
                variant="outline"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add-on
              </Button>
            </div>
            {addOnFields.fields.map((field, index) => (
              <div
                className="flex flex-col gap-2 rounded-md border border-border p-3"
                key={field.id}
              >
                <Field
                  error={errors.addOns?.[index]?.addOnId?.message}
                  htmlFor={`addon-select-${field.id}`}
                  label="Add-on"
                >
                  <Select
                    id={`addon-select-${field.id}`}
                    {...register(`addOns.${index}.addOnId`)}
                  >
                    {activeAddOns.map((addOn) => (
                      <option key={addOn.id} value={addOn.id}>
                        {addOn.name} ({formatCurrency(addOn.price)})
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="grid gap-2  sm:items-end">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Field
                      error={errors.addOns?.[index]?.minSelection?.message}
                      htmlFor={`addon-min-${field.id}`}
                      label="Minimal"
                    >
                      <Input
                        id={`addon-min-${field.id}`}
                        min={0}
                        type="number"
                        {...register(`addOns.${index}.minSelection`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <Field
                      error={errors.addOns?.[index]?.maxSelection?.message}
                      htmlFor={`addon-max-${field.id}`}
                      label="Maksimal"
                    >
                      <Input
                        id={`addon-max-${field.id}`}
                        min={1}
                        type="number"
                        {...register(`addOns.${index}.maxSelection`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>
                  <label
                    className="flex min-h-11 items-center gap-2 text-caption text-foreground"
                    htmlFor={`addon-required-${field.id}`}
                  >
                    <Checkbox
                      id={`addon-required-${field.id}`}
                      {...register(`addOns.${index}.isRequired`)}
                    />
                    Wajib dipilih
                  </label>
                  <Button
                    aria-label="Hapus add-on"
                    onClick={() => addOnFields.remove(index)}
                    size="lg"
                    className="w-full"
                    variant="danger"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" /> Hapus
                    Add-on
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
          description="Informasi produk, varian, dan add-on."
          onOpenChange={(open) => {
            if (!open) {
              setDetail(null);
            }
          }}
          open={detail !== null}
          title={detail?.name ?? "Detail produk"}
        >
          {detail ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-subtle text-muted-foreground">
                  <ProductImage
                    iconClassName="h-7 w-7"
                    name={detail.name}
                    src={detail.imageUrl}
                  />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-card-title text-foreground">
                    {detail.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {categoryName(detail.categoryId)}
                  </p>
                </div>
              </div>
              <dl className="grid gap-2 text-body">
                {detail.variants.length === 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Harga dasar</dt>
                    <dd className="font-medium tabular-nums">
                      {detail.basePrice === null
                        ? "Harga produk belum dikonfigurasi"
                        : formatCurrency(detail.basePrice)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Ketersediaan</dt>
                  <dd>
                    <Badge tone={availabilityState(detail).tone}>
                      {availabilityState(detail).label}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge tone={detail.isActive ? "success" : "neutral"}>
                      {detail.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </dd>
                </div>
              </dl>
              {detail.description ? (
                <p className="text-body text-muted-foreground">
                  {detail.description}
                </p>
              ) : null}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-label font-medium text-foreground">Varian</p>
                {detail.variants.length === 0 ? (
                  <p className="text-body text-muted-foreground">Tidak ada</p>
                ) : (
                  detail.variants.map((variant) => (
                    <div
                      className="flex items-center justify-between gap-2 text-body"
                      key={variant.id}
                    >
                      <span>
                        {variant.name}
                        {variant.isActive ? null : (
                          <span className="ml-2 text-caption text-muted-foreground">
                            Nonaktif
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatCurrency(variant.price)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-label font-medium text-foreground">Add-on</p>
                {detail.addOns.length === 0 ? (
                  <p className="text-body text-muted-foreground">Tidak ada</p>
                ) : (
                  detail.addOns.map((relation) => {
                    const addOn = addOns.find(
                      (candidate) => candidate.id === relation.addOnId,
                    );
                    return (
                      <div
                        className="flex items-center justify-between gap-2 text-body"
                        key={relation.addOnId}
                      >
                        <span>{addOn?.name ?? "Add-on tidak ditemukan"}</span>
                        <span className="text-caption text-muted-foreground">
                          {relation.isRequired ? "Wajib" : "Opsional"}, min{" "}
                          {relation.minSelection}, maks {relation.maxSelection}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <PermissionGate permission="products.manage">
                <Button onClick={() => openEdit(detail)} variant="outline">
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  Ubah produk
                </Button>
              </PermissionGate>
            </div>
          ) : null}
        </Drawer>
      </div>
    </RequirePermission>
  );
}
