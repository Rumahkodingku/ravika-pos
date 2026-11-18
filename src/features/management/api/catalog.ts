"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/keys";
import type { AddOnInput } from "@/modules/catalog/catalog.schemas";
import type {
  CategoryListParams,
  Paginated,
  ProductListParams,
} from "@/types/api";
import type { AddOn, Category, Product, ProductAddOn } from "@/types/domain";

function listPath(path: string, params: Record<string, unknown>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const search = query.toString();

  return search ? `${path}?${search}` : path;
}

export type CategoryInput = {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductVariantInput = {
  id?: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
};

export type ProductInput = {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  isAvailable: boolean;
  isActive: boolean;
  variants: ProductVariantInput[];
  addOns: ProductAddOn[];
};

function toProductInput(product: Product): ProductInput {
  return {
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    isAvailable: product.isAvailable,
    isActive: product.isActive,
    variants: product.variants.map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      name: variant.name,
      priceAdjustment: variant.priceAdjustment,
      isActive: variant.isActive,
    })),
    addOns: product.addOns.map((relation) => ({ ...relation })),
  };
}

function useCatalogInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };
}

export function useCategoriesQuery(params: CategoryListParams) {
  return useQuery({
    queryFn: () =>
      apiFetch<Paginated<Category>>(listPath("/categories", params)),
    queryKey: queryKeys.categories(params),
  });
}

export function useProductsQuery(params: ProductListParams) {
  return useQuery({
    queryFn: () => apiFetch<Paginated<Product>>(listPath("/products", params)),
    queryKey: queryKeys.products(params),
  });
}

export function useProductQuery(id: string | null) {
  return useQuery({
    enabled: id !== null,
    queryFn: () => apiFetch<Product>(`/products/${id}`),
    queryKey: queryKeys.product(id ?? ""),
  });
}

export function useAddOnsQuery() {
  return useQuery({
    queryFn: () => apiFetch<AddOn[]>("/add-ons"),
    queryKey: queryKeys.addOns,
  });
}

export function useCreateAddOnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddOnInput) =>
      apiFetch<AddOn>("/add-ons", { body: input, method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addOns });
    },
  });
}

export function useUpdateAddOnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddOnInput }) =>
      apiFetch<AddOn>(`/add-ons/${id}`, { body: input, method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addOns });
    },
  });
}

export function useSetAddOnActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addOn, isActive }: { addOn: AddOn; isActive: boolean }) =>
      apiFetch<AddOn>(`/add-ons/${addOn.id}`, {
        body: { isActive, name: addOn.name, price: addOn.price },
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addOns });
    },
  });
}

export function useCreateCategoryMutation() {
  const onSuccess = useCatalogInvalidation();

  return useMutation({
    mutationFn: (input: CategoryInput) =>
      apiFetch<Category>("/categories", { body: input, method: "POST" }),
    onSuccess,
  });
}

export function useUpdateCategoryMutation() {
  const onSuccess = useCatalogInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      apiFetch<Category>(`/categories/${id}`, { body: input, method: "PATCH" }),
    onSuccess,
  });
}

export function useMoveCategoryMutation() {
  const onSuccess = useCatalogInvalidation();

  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: "up" | "down" }) =>
      apiFetch<Paginated<Category>>(`/categories/${id}/move`, {
        body: { direction },
        method: "POST",
      }),
    onSuccess,
  });
}

export function useSetCategoryActiveMutation() {
  const onSuccess = useCatalogInvalidation();

  return useMutation({
    mutationFn: ({
      category,
      isActive,
    }: {
      category: Category;
      isActive: boolean;
    }) =>
      apiFetch<Category>(`/categories/${category.id}`, {
        body: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive,
        },
        method: "PATCH",
      }),
    onSuccess,
  });
}

export function useCreateProductMutation() {
  const onSuccess = useCatalogInvalidation();

  return useMutation({
    mutationFn: (input: ProductInput) =>
      apiFetch<Product>("/products", { body: input, method: "POST" }),
    onSuccess,
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) =>
      apiFetch<Product>(`/products/${id}`, { body: input, method: "PATCH" }),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.product(product.id), product);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUploadProductImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, image }: { id: string; image: Blob }) => {
      const body = new FormData();
      body.append("image", image, "product.webp");

      return apiFetch<{ imageUrl: string }>(`/products/${id}/image`, {
        body,
        method: "PUT",
      });
    },
    onSuccess: ({ imageUrl }, { id }) => {
      const product = queryClient.getQueryData<Product>(queryKeys.product(id));

      if (product) {
        queryClient.setQueryData(queryKeys.product(id), {
          ...product,
          imageUrl,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
    },
  });
}

export function useDeleteProductImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/products/${id}/image`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      const product = queryClient.getQueryData<Product>(queryKeys.product(id));

      if (product) {
        queryClient.setQueryData(queryKeys.product(id), {
          ...product,
          imageUrl: null,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["public"] });
    },
  });
}

export function useSetProductFlagsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      flags,
    }: {
      id: string;
      flags: Partial<Pick<Product, "isAvailable" | "isActive">>;
    }) => {
      const cached = queryClient.getQueryData<Product>(queryKeys.product(id));
      const product = cached ?? (await apiFetch<Product>(`/products/${id}`));

      return apiFetch<Product>(`/products/${id}`, {
        body: toProductInput({ ...product, ...flags }),
        method: "PATCH",
      });
    },
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.product(product.id), product);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
