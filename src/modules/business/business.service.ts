import "server-only";

import type { AppDatabase } from "@/infrastructure/database/types";
import { AppError } from "@/shared/errors/app-error";
import type { Business } from "@/types/domain";
import {
  findBusinessByCode,
  findBusinessById,
  updateBusiness as updateBusinessRow,
} from "./business.repository";
import type { BusinessInput } from "./business.schemas";

function toBusiness(row: {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}): Business {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getBusiness(db: AppDatabase, businessId: string) {
  const row = await findBusinessById(db, businessId);

  if (!row) {
    throw AppError.notFound(
      "BUSINESS_NOT_FOUND",
      "Profil bisnis tidak ditemukan.",
    );
  }

  return toBusiness(row);
}

export async function updateBusiness(
  db: AppDatabase,
  businessId: string,
  input: BusinessInput,
) {
  const existing = await findBusinessByCode(db, input.code);

  if (existing && existing.id !== businessId) {
    throw AppError.conflict(
      "BUSINESS_CODE_CONFLICT",
      "Kode bisnis sudah dipakai.",
    );
  }

  await updateBusinessRow(db, businessId, input);

  return getBusiness(db, businessId);
}
