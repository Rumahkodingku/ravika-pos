import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { users } from "./access";
import { business } from "./business";

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("audit_logs_business_id_idx").on(table.businessId),
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
  ],
);

export const licenses = sqliteTable(
  "licenses",
  {
    id: text("id").primaryKey(),
    businessIdentifier: text("business_identifier").notNull(),
    installationId: text("installation_id").notNull().unique(),
    licensePayload: text("license_payload").notNull(),
    issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    status: text("status", {
      enum: ["VALID", "EXPIRING", "INVALID"],
    }).notNull(),
    validationMessage: text("validation_message").notNull().default(""),
    signature: text("signature").notNull(),
    publicKeyFingerprint: text("public_key_fingerprint").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    check(
      "licenses_status_check",
      sql`${table.status} IN ('VALID', 'EXPIRING', 'INVALID')`,
    ),
  ],
);

export const backupRecords = sqliteTable(
  "backup_records",
  {
    id: text("id").primaryKey(),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size").notNull(),
    checksum: text("checksum").notNull(),
    status: text("status", {
      enum: ["READY", "IN_PROGRESS", "FAILED"],
    }).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("backup_records_created_at_idx").on(table.createdAt),
    check("backup_records_file_size_check", sql`${table.fileSize} >= 0`),
    check(
      "backup_records_status_check",
      sql`${table.status} IN ('READY', 'IN_PROGRESS', 'FAILED')`,
    ),
  ],
);

export const idempotencyKeys = sqliteTable(
  "idempotency_keys",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    key: text("key").notNull(),
    operation: text("operation").notNull(),
    requestHash: text("request_hash").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    responseStatus: integer("response_status").notNull(),
    responseBody: text("response_body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("idempotency_keys_business_operation_key_unique").on(
      table.businessId,
      table.operation,
      table.key,
    ),
    index("idempotency_keys_expires_at_idx").on(table.expiresAt),
    index("idempotency_keys_resource_idx").on(
      table.resourceType,
      table.resourceId,
    ),
  ],
);
