import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { business } from "./business";

export const roles = sqliteTable(
  "roles",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description").notNull().default(""),
    isSystem: integer("is_system", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("roles_business_code_unique").on(table.businessId, table.code),
    index("roles_business_id_idx").on(table.businessId),
  ],
);

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  groupName: text("group_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ],
);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "restrict" }),
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("users_business_id_idx").on(table.businessId),
    index("users_role_id_idx").on(table.roleId),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
