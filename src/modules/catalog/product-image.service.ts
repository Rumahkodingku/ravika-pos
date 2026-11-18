import "server-only";

import { createHash } from "node:crypto";
import type { AppDatabase } from "@/infrastructure/database/types";
import { AppError } from "@/shared/errors/app-error";
import { now } from "@/shared/time";
import { findProduct } from "./catalog.repository";
import {
  deleteProductImage,
  findProductImage,
  upsertProductImage,
} from "./product-image.repository";

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const mimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
type ProductImageMime = (typeof mimeTypes)[number];

function hasPrefix(data: Uint8Array, bytes: number[]) {
  return bytes.every((byte, index) => data[index] === byte);
}

function isWebp(data: Uint8Array) {
  return (
    data.length >= 12 &&
    String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...data.slice(8, 12)) === "WEBP"
  );
}

export function validateProductImage(
  data: Uint8Array,
  mimeType: string,
): ProductImageMime {
  if (!mimeTypes.includes(mimeType as ProductImageMime)) {
    throw AppError.validation([
      {
        path: "image",
        message: "Gambar harus JPEG, PNG, atau WebP.",
      },
    ]);
  }

  if (data.length === 0) {
    throw AppError.validation([
      { path: "image", message: "File gambar kosong." },
    ]);
  }

  if (data.length > PRODUCT_IMAGE_MAX_BYTES) {
    throw AppError.validation([
      { path: "image", message: "Ukuran gambar maksimal 5 MB." },
    ]);
  }

  const valid = {
    "image/jpeg": hasPrefix(data, [0xff, 0xd8, 0xff]),
    "image/png": hasPrefix(
      data,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    ),
    "image/webp": isWebp(data),
  }[mimeType as ProductImageMime];

  if (!valid) {
    throw AppError.validation([
      { path: "image", message: "Isi file bukan gambar yang valid." },
    ]);
  }

  return mimeType as ProductImageMime;
}

export function productImageUrl(productId: string, updatedAt: Date) {
  return `/api/product-images/${productId}?v=${updatedAt.getTime()}`;
}

export async function saveProductImage(
  db: AppDatabase,
  businessId: string,
  productId: string,
  input: { data: Uint8Array; mimeType: string },
) {
  const product = await findProduct(db, businessId, productId);

  if (!product) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
  }

  const mimeType = validateProductImage(input.data, input.mimeType);
  const checksum = createHash("sha256").update(input.data).digest("hex");
  const timestamp = now();

  await upsertProductImage(db, {
    productId,
    mimeType,
    data: Buffer.from(input.data),
    fileSize: input.data.length,
    checksum,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return productImageUrl(productId, timestamp);
}

export async function getProductImage(db: AppDatabase, productId: string) {
  const image = await findProductImage(db, productId);

  if (!image) {
    throw AppError.notFound(
      "PRODUCT_IMAGE_NOT_FOUND",
      "Gambar produk tidak ditemukan.",
    );
  }

  return image;
}

export async function removeProductImage(
  db: AppDatabase,
  businessId: string,
  productId: string,
) {
  const product = await findProduct(db, businessId, productId);

  if (!product) {
    throw AppError.notFound("PRODUCT_NOT_FOUND", "Produk tidak ditemukan.");
  }

  await deleteProductImage(db, productId);
}
