import { existsSync } from "node:fs";
import { resolve } from "node:path";

const configFile = process.env.RAVIKA_CONFIG_FILE;

if (configFile && existsSync(resolve(configFile))) {
  process.loadEnvFile(resolve(configFile));
}

process.env.PORT ??= "3000";
process.env.HOSTNAME ??= "0.0.0.0";

await import("./server.js");
