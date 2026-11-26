import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { productPriceDisplay } from "@/lib/catalog-pricing";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { pageOf, textMatch } from "@/shared/pagination";
import { now } from "@/shared/time";
import type {
  AddOn,
  Category,
  Product,
  ProductAddOn,
  ProductVariant,
} from "@/types/domain";
import {
  deleteProductAddOns,
  deleteVariants,
  findAddOn,
  findAddOnByName,
  findCategory,
  findProduct,
  insertAddOn,
  insertCategory,
  insertProduct,
  insertProductAddOns,
  insertVariants,
  listAddOnRows,
  listCategoryRows,
  listProductAddOnRows,
  listProductRows,
  listVariantRows,
  updateAddOnRow,
  updateCategoryRow,
  updateProductRow,
} from "./catalog.repository";
import type {
  AddOnInput,
  CategoryInput,
  ProductInput,
} from "./catalog.schemas";
import { listProductImages } from "./product-image.repository";
import { productImageUrl } from "./product-image.service";

function toCategory(
  row: Awaited<ReturnType<typeof listCategoryRows>>[number],
): Category {
  return {
    id: row.id,
    businessId: row.businessId,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAddOn(
  row: Awaited<ReturnType<typeof listAddOnRows>>[number],
): AddOn {
  return {
    id: row.id,
    businessId: row.businessId,
    name: row.name,
    price: row.price,
    isActive: row.isActive,
  };
}

async function toProducts(
  db: AppDatabase,
  rows: Awaited<ReturnType<typeof listProductRows>>,
): Promise<Product[]> {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row.id);
  const variants = await listVariantRows(db, ids);
  const relations = await listProductAddOnRows(db, ids);
  const images = await listProductImages(db, ids);
  const imageByProduct = new Map(
    images.map((image) => [image.productId, image]),
  );

  return rows.map((row) => {
    const image = imageByProduct.get(row.id);

    return {
      id: row.id,
      businessId: row.businessId,
      categoryId: row.categoryId,
      name: row.name,
      description: row.description,
      imageUrl: image ? productImageUrl(row.id, image.updatedAt) : null,
      basePrice: row.basePrice,
      isAvailable: row.isAvailable,
      isActive: row.isActive,
      variants: variants
        .filter((variant) => variant.productId === row.id)
        .map(
          (variant): ProductVariant => ({
            id: variant.id,
            name: variant.name,
            price: variant.price,
            isActive: variant.isActive,
          }),
        ),
      addOns: relations
        .filter((relation) => relation.productId === row.id)
        .map(
          (relation): ProductAddOn => ({
            addOnId: relation.addOnId,
            isRequired: relation.isRequired,
            minSelection: relation.minSelection,
            maxSelection: relation.maxSelection,
          }),
        ),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export async function listCategories(
  db: AppDatabase,
  businessId: string,
  params: {
    search?: string;
    active?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const rows = await listCategoryRows(db, businessId);
  const items = rows
    .filter(
      (row) =>
        textMatch(row.name, params.search) &&
        (!params.active ||
          params.active === "all" ||
          String(row.isActive) === params.active),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(toCategory);

  return pageOf(items, params.page, params.pageSize);
}

export async function createCategory(
  db: AppDatabase,
  businessId: string,
  input: CategoryInput,
) {
  const timestamp = now();
  const id = newId();
  const rows = await listCategoryRows(db, businessId);
  const sortOrder =
    rows.reduce((highest, row) => Math.max(highest, row.sortOrder), -1) + 1;

  await insertCategory(db, {
    id,
    businessId,
    ...input,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const row = await findCategory(db, businessId, id);

  if (!row) {
    throw AppError.internal();
  }

  return toCategory(row);
}

export async function updateCategory(
  db: AppDatabase,
  businessId: string,
  id: string,
  input: CategoryInput,
) {
  const row = await findCategory(db, businessId, id);

  if (!row) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Kategori tidak ditemukan.");
  }

  await updateCategoryRow(db, id, { ...input, updatedAt: now() });
  const updated = await findCategory(db, businessId, id);

  if (!updated) {
    throw AppError.internal();
  }

  return toCategory(updated);
}

export async function moveCategory(
  db: AppDatabase,
  businessId: string,
  id: string,
  direction: "up" | "down",
) {
  const rows = (await listCategoryRows(db, businessId)).sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || target < 0 || target >= rows.length) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Kategori tidak ditemukan.");
  }

  const current = rows[index];
  const next = rows[target];

  await db.transaction(async (tx) => {
    await updateCategoryRow(tx, current.id, {
      sortOrder: next.sortOrder,
      updatedAt: now(),
    });
    await updateCategoryRow(tx, next.id, {
      sortOrder: current.sortOrder,
      updatedAt: now(),
    });
  });

  return listCategories(db, businessId, {});
}

export async function listProducts(
  db: AppDatabase,
  businessId: string,
  params: {
    search?: string;
    categoryId?: string;
    active?: string;
    availability?: string;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  },
) {
  const rows = await toProducts(db, await listProductRows(db, businessId));
  const filtered = rows.filter(
    (row) =>
      textMatch(row.name, params.search) &&
      (!params.categoryId ||
        params.categoryId === "all" ||
        row.categoryId === params.categoryId) &&
      (!params.active ||
        params.active === "all" ||
        String(row.isActive) === params.active) &&
      (!params.availability ||
        params.availability === "all" ||
        String(row.isAvailable) === params.availability),
  );

  if (params.sortBy === "price") {
    const priceOf = (product: Product) => {
      const display = productPriceDisplay(product);

      return display.kind === "unavailable" ? null : display.amount;
    };

    filtered.sort((left, right) => {
      const leftPrice = priceOf(left);
      const rightPrice = priceOf(right);

      if (leftPrice === null || rightPrice === null) {
        return leftPrice === rightPrice ? 0 : leftPrice === null ? 1 : -1;
      }

      return params.sortDir === "desc"
        ? rightPrice - leftPrice
        : leftPrice - rightPrice;
    });
  } else {
    filtered.sort((left, right) => left.name.localeCompare(right.name));
  }

  return pageOf(filtered, params.page, params.pageSize);
}

export async function getProduct(
  db: AppDatabase,
  businessId: string,
  id: string,
) {
  const row = await findProduct(db, businessId, id);

  if (!row) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
  }

  return (await toProducts(db, [row]))[0];
}

function relationValues(input: ProductInput, productId: string) {
  return input.addOns.map((relation) => ({
    productId,
    addOnId: relation.addOnId,
    isRequired: relation.isRequired,
    minSelection: relation.minSelection,
    maxSelection: relation.maxSelection,
  }));
}

async function validateRelations(
  db: AppDatabase,
  businessId: string,
  input: ProductInput,
) {
  if (input.variants.length === 0 && input.basePrice === null) {
    throw AppError.validation([
      { path: "basePrice", message: "Harga dasar wajib diisi." },
    ]);
  }

  if (input.variants.length > 0 && input.basePrice !== null) {
    throw AppError.validation([
      {
        path: "basePrice",
        message: "Produk dengan varian tidak menggunakan harga dasar.",
      },
    ]);
  }

  const category = await findCategory(db, businessId, input.categoryId);

  if (!category) {
    throw AppError.notFound("CATEGORY_NOT_FOUND", "Kategori tidak ditemukan.");
  }

  for (const relation of input.addOns) {
    const addOn = await findAddOn(db, businessId, relation.addOnId);

    if (!addOn) {
      throw AppError.validation([
        { path: "addOns", message: "Add-on tidak ditemukan." },
      ]);
    }
    if (!addOn.isActive) {
      throw AppError.validation([
        { path: "addOns", message: "Add-on tidak aktif." },
      ]);
    }
  }

  const names = input.variants.map((variant) => variant.name.toLowerCase());

  if (new Set(names).size !== names.length) {
    throw AppError.validation([
      { path: "variants", message: "Nama varian harus unik." },
    ]);
  }
}

export async function createProduct(
  db: AppDatabase,
  businessId: string,
  input: ProductInput,
) {
  await validateRelations(db, businessId, input);
  const timestamp = now();
  const id = newId();

  await db.transaction(async (tx) => {
    await insertProduct(tx, {
      id,
      businessId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      isAvailable: input.isAvailable,
      isActive: input.isActive,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await insertVariants(
      tx,
      input.variants.map((variant) => ({
        id: variant.id ?? newId(),
        productId: id,
        name: variant.name,
        price: variant.price,
        isActive: variant.isActive,
      })),
    );
    await insertProductAddOns(tx, relationValues(input, id));
  });

  return getProduct(db, businessId, id);
}

export async function updateProduct(
  db: AppDatabase,
  businessId: string,
  id: string,
  input: ProductInput,
) {
  const existing = await findProduct(db, businessId, id);

  if (!existing) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
  }

  await validateRelations(db, businessId, input);

  await db.transaction(async (tx) => {
    await updateProductRow(tx, id, {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      basePrice: input.basePrice,
      isAvailable: input.isAvailable,
      isActive: input.isActive,
      updatedAt: now(),
    });
    await deleteVariants(tx, id);
    await insertVariants(
      tx,
      input.variants.map((variant) => ({
        id: variant.id ?? newId(),
        productId: id,
        name: variant.name,
        price: variant.price,
        isActive: variant.isActive,
      })),
    );
    await deleteProductAddOns(tx, id);
    await insertProductAddOns(tx, relationValues(input, id));
  });

  return getProduct(db, businessId, id);
}

export async function createAddOn(
  db: AppDatabase,
  businessId: string,
  input: AddOnInput,
) {
  if (await findAddOnByName(db, businessId, input.name)) {
    throw AppError.conflict(
      "ADDON_NAME_CONFLICT",
      "Nama add-on sudah dipakai.",
    );
  }

  const timestamp = now();
  const id = newId();

  await insertAddOn(db, {
    id,
    businessId,
    name: input.name,
    price: input.price,
    isActive: input.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return (await listAddOnRows(db, businessId))
    .filter((row) => row.id === id)
    .map(toAddOn)[0];
}

export async function updateAddOn(
  db: AppDatabase,
  businessId: string,
  id: string,
  input: AddOnInput,
) {
  const existing = await findAddOn(db, businessId, id);

  if (!existing) {
    throw AppError.notFound("ADDON_NOT_FOUND", "Add-on tidak ditemukan.");
  }

  if (await findAddOnByName(db, businessId, input.name, id)) {
    throw AppError.conflict(
      "ADDON_NAME_CONFLICT",
      "Nama add-on sudah dipakai.",
    );
  }

  await updateAddOnRow(db, id, {
    name: input.name,
    price: input.price,
    isActive: input.isActive,
    updatedAt: now(),
  });

  const updated = await findAddOn(db, businessId, id);

  if (!updated) {
    throw AppError.internal();
  }

  return toAddOn(updated);
}

export async function listAddOns(db: AppDatabase, businessId: string) {
  return (await listAddOnRows(db, businessId)).map(toAddOn);
}
