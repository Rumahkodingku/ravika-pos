import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { findFirstBusiness } from "@/modules/business/business.repository";
import {
  listAddOns,
  listCategories,
  listProducts,
} from "@/modules/catalog/catalog.service";
import { decryptQrToken, encryptQrToken } from "@/shared/crypto/qr-token";
import { AppError } from "@/shared/errors/app-error";
import { hashToken, newId, newToken } from "@/shared/ids";
import { pageOf, textMatch } from "@/shared/pagination";
import { now } from "@/shared/time";
import type { DiningTable, Product } from "@/types/domain";
import {
  countActiveOrdersForTable,
  findTable,
  findTableByName,
  findTableByTokenHash,
  insertTable,
  listActiveTableOrderRows,
  listTableRows,
  updateTableRow,
} from "./table.repository";
import type { TableInput } from "./table.schemas";

export type TableSummary = Omit<DiningTable, "qrToken"> & {
  activeOrderCount: number;
};
export type TableWithToken = DiningTable;

function toSummary(
  row: Awaited<ReturnType<typeof listTableRows>>[number],
  activeOrderCount: number,
): TableSummary {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    isActive: row.isActive,
    activeOrderCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toTable(
  row: Awaited<ReturnType<typeof listTableRows>>[number],
  qrToken: string,
): TableWithToken {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    isActive: row.isActive,
    qrToken,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function makeTokenPair(tableId: string) {
  const token = newToken();

  return {
    token,
    hash: hashToken(token),
    ciphertext: encryptQrToken(tableId, token),
  };
}

export async function listTables(
  db: AppDatabase,
  params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const counts = new Map<string, number>();

  for (const order of await listActiveTableOrderRows(db)) {
    if (order.tableId) {
      counts.set(order.tableId, (counts.get(order.tableId) ?? 0) + 1);
    }
  }

  const rows = (await listTableRows(db))
    .filter(
      (row) =>
        textMatch(row.name, params.search) &&
        (!params.status ||
          params.status === "all" ||
          row.status === params.status),
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  return pageOf(
    rows.map((row) => toSummary(row, counts.get(row.id) ?? 0)),
    params.page,
    params.pageSize,
  );
}

export async function getTable(db: AppDatabase, id: string) {
  const row = await findTable(db, id);

  if (!row) {
    throw AppError.notFound("TABLE_NOT_FOUND", "Meja tidak ditemukan.");
  }

  if (!row.qrTokenCiphertext) {
    throw AppError.conflict(
      "QR_TOKEN_UNAVAILABLE",
      "QR meja harus dibuat ulang.",
    );
  }

  return toTable(row, decryptQrToken(row.id, row.qrTokenCiphertext));
}

export async function createTable(db: AppDatabase, input: TableInput) {
  if (await findTableByName(db, input.name)) {
    throw AppError.conflict("TABLE_NAME_CONFLICT", "Nama meja sudah dipakai.");
  }

  const id = newId();
  const token = makeTokenPair(id);
  const timestamp = now();

  await insertTable(db, {
    id,
    name: input.name,
    status: input.status,
    qrTokenHash: token.hash,
    qrTokenCiphertext: token.ciphertext,
    isActive: input.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const row = await findTable(db, id);

  if (!row) {
    throw AppError.internal();
  }

  return toTable(row, token.token);
}

export async function updateTableById(
  db: AppDatabase,
  id: string,
  input: TableInput,
) {
  const row = await findTable(db, id);

  if (!row) {
    throw AppError.notFound("TABLE_NOT_FOUND", "Meja tidak ditemukan.");
  }

  if (await findTableByName(db, input.name, id)) {
    throw AppError.conflict("TABLE_NAME_CONFLICT", "Nama meja sudah dipakai.");
  }

  const activeOrders = await countActiveOrdersForTable(db, id);

  if (
    activeOrders > 0 &&
    (input.status === "AVAILABLE" ||
      input.status === "INACTIVE" ||
      !input.isActive)
  ) {
    throw AppError.conflict(
      "TABLE_NOT_AVAILABLE",
      "Meja masih memiliki pesanan aktif.",
    );
  }

  await updateTableRow(db, id, { ...input, updatedAt: now() });
  return getTable(db, id);
}

export async function regenerateTableToken(db: AppDatabase, id: string) {
  const row = await findTable(db, id);

  if (!row) {
    throw AppError.notFound("TABLE_NOT_FOUND", "Meja tidak ditemukan.");
  }

  const token = makeTokenPair(id);
  await updateTableRow(db, id, {
    qrTokenHash: token.hash,
    qrTokenCiphertext: token.ciphertext,
    updatedAt: now(),
  });

  return { table: await getTable(db, id), qrToken: token.token };
}

export async function getPublicMenu(db: AppDatabase, token: string) {
  const table = await findTableByTokenHash(db, hashToken(token));

  if (!table || !table.isActive || table.status === "INACTIVE") {
    throw AppError.notFound(
      "QR_TOKEN_INVALID",
      "Token QR tidak valid atau meja tidak aktif.",
    );
  }

  const business = await findFirstBusiness(db);

  if (!business) {
    throw AppError.internal();
  }

  const categories = await listCategories(db, business.id, {
    active: "true",
    pageSize: 1000,
  });
  const products = await listProducts(db, business.id, {
    active: "true",
    availability: "true",
    pageSize: 1000,
  });
  const referencedAddOnIds = new Set(
    products.items.flatMap((product) =>
      product.addOns.map((relation) => relation.addOnId),
    ),
  );
  const activeAddOns = (await listAddOns(db, business.id)).filter(
    (addOn) => addOn.isActive && referencedAddOnIds.has(addOn.id),
  );

  return {
    business: {
      name: business.name,
      address: business.address,
    },
    table: {
      id: table.id,
      name: table.name,
    },
    categories: categories.items.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    products: products.items.map((product: Product) => ({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      variants: product.variants.filter((variant) => variant.isActive),
      addOns: product.addOns,
    })),
    addOns: activeAddOns,
  };
}
