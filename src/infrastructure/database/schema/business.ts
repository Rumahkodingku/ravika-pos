import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const business = sqliteTable("business", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
