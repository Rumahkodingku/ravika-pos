import "server-only";

import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { licenses } from "@/infrastructure/database/schema";
import type { AppDatabase } from "@/infrastructure/database/types";
import { findFirstBusiness } from "@/modules/business/business.repository";
import { AppError } from "@/shared/errors/app-error";
import { newId } from "@/shared/ids";
import { stableStringify } from "@/shared/stable-json";
import { now } from "@/shared/time";
import type { License, LicenseStatus } from "@/types/domain";

type Payload = {
  licenseId: string;
  businessIdentifier: string;
  installationId: string;
  issuedAt: string;
  expiresAt: string;
};

type Result = {
  payload: Partial<Payload>;
  signature: string;
  status: LicenseStatus;
  message: string;
  fingerprint: string;
};

const EXPIRING_DAYS = 30;

function fingerprint(publicKey: Buffer) {
  return createHash("sha256").update(publicKey).digest("hex");
}

function verification(input: {
  payload: Partial<Payload>;
  signature: string;
  publicKeyBase64: string;
  businessId: string;
  installationId: string;
}): Pick<Result, "status" | "message"> {
  if (!input.publicKeyBase64) {
    return {
      status: "INVALID",
      message: "Public key lisensi tidak tersedia.",
    };
  }

  let key: ReturnType<typeof createPublicKey>;

  try {
    key = createPublicKey({
      key: Buffer.from(input.publicKeyBase64, "base64"),
      format: "der",
      type: "spki",
    });
  } catch {
    return { status: "INVALID", message: "Public key lisensi tidak valid." };
  }

  const signed = stableStringify(input.payload);
  const valid = verify(
    null,
    Buffer.from(signed),
    key,
    Buffer.from(input.signature, "base64url"),
  );

  if (!valid) {
    return { status: "INVALID", message: "Tanda tangan lisensi tidak valid." };
  }
  if (input.payload.businessIdentifier !== input.businessId) {
    return { status: "INVALID", message: "Lisensi bukan untuk bisnis ini." };
  }
  if (input.payload.installationId !== input.installationId) {
    return { status: "INVALID", message: "Lisensi bukan untuk instalasi ini." };
  }

  const expiresAt = input.payload.expiresAt
    ? new Date(input.payload.expiresAt)
    : null;

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { status: "INVALID", message: "Tanggal lisensi tidak valid." };
  }

  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return { status: "INVALID", message: "Lisensi sudah kedaluwarsa." };
  }

  if (
    expiresAt &&
    expiresAt.getTime() - Date.now() <= EXPIRING_DAYS * 24 * 60 * 60 * 1000
  ) {
    return { status: "EXPIRING", message: "Lisensi akan segera berakhir." };
  }

  return { status: "VALID", message: "" };
}

function readLicenseFile(businessId: string, installationId: string): Result {
  const file = process.env.RAVIKA_LICENSE_FILE;
  const publicKeyBase64 = process.env.RAVIKA_LICENSE_PUBLIC_KEY ?? "";
  const keyFingerprint = publicKeyBase64
    ? fingerprint(Buffer.from(publicKeyBase64, "base64"))
    : "";

  if (!file) {
    return {
      payload: {},
      signature: "",
      status: "INVALID",
      message: "File lisensi tidak dikonfigurasi.",
      fingerprint: keyFingerprint,
    };
  }

  let raw: { payload?: Partial<Payload>; signature?: string };

  try {
    raw = JSON.parse(readFileSync(resolve(file), "utf8"));
  } catch {
    return {
      payload: {},
      signature: "",
      status: "INVALID",
      message: "File lisensi tidak dapat dibaca.",
      fingerprint: keyFingerprint,
    };
  }

  const payload = raw.payload ?? {};
  const signature = raw.signature ?? "";
  const result = verification({
    payload,
    signature,
    publicKeyBase64,
    businessId,
    installationId,
  });

  return {
    payload,
    signature,
    fingerprint: keyFingerprint,
    ...result,
  };
}

function toLicense(row: typeof licenses.$inferSelect): License {
  return {
    id: row.id,
    businessIdentifier: row.businessIdentifier,
    installationId: row.installationId,
    issuedAt: row.issuedAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    status: row.status,
    publicKeyFingerprint: row.publicKeyFingerprint,
    validationMessage: row.validationMessage,
  };
}

export async function getLicenseStatus(db: AppDatabase) {
  const business = await findFirstBusiness(db);

  if (!business) {
    throw AppError.internal();
  }

  const installationId =
    process.env.RAVIKA_INSTALLATION_ID ?? "installation-ravika";
  const result = readLicenseFile(business.id, installationId);
  const timestamp = now();
  const issuedAt = result.payload.issuedAt
    ? new Date(result.payload.issuedAt)
    : timestamp;
  const expiresAt = result.payload.expiresAt
    ? new Date(result.payload.expiresAt)
    : null;
  const existing = (
    await db
      .select()
      .from(licenses)
      .where(eq(licenses.installationId, installationId))
      .limit(1)
  )[0];

  const values = {
    businessIdentifier: result.payload.businessIdentifier ?? business.id,
    installationId,
    licensePayload: stableStringify(result.payload),
    issuedAt: Number.isNaN(issuedAt.getTime()) ? timestamp : issuedAt,
    expiresAt:
      expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    status: result.status,
    validationMessage: result.message,
    signature: result.signature,
    publicKeyFingerprint: result.fingerprint,
    updatedAt: timestamp,
  };

  if (existing) {
    await db.update(licenses).set(values).where(eq(licenses.id, existing.id));
    return toLicense({ ...existing, ...values });
  }

  const row = {
    id: newId(),
    ...values,
    createdAt: timestamp,
  };

  await db.insert(licenses).values(row);
  return toLicense(row);
}
