import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/infrastructure/database/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.RAVIKA_DB_PATH ?? "./data/ravika.sqlite",
  },
});
