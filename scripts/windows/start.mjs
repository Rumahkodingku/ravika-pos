import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const configFile = process.env.RAVIKA_CONFIG_FILE;

if (configFile && existsSync(resolve(configFile))) {
  process.loadEnvFile(resolve(configFile));
}

process.env.PORT ??= "3000";
process.env.HOSTNAME ??= "0.0.0.0";

const appDir = resolve(process.env.RAVIKA_APP_DIR ?? process.cwd());
process.env.RAVIKA_MIGRATIONS_DIR ??= resolve(appDir, "drizzle");

const server = resolve(appDir, "server.js");

await import(pathToFileURL(server).href);
