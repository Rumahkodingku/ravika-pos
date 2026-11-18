import "server-only";

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";

export function upsertEnvValue(filePath: string, key: string, value: string) {
  const lines = existsSync(filePath)
    ? readFileSync(filePath, "utf8").split(/\r?\n/)
    : [];
  const filtered = lines.filter((line) => !line.startsWith(`${key}=`));
  filtered.push(`${key}=${value}`);

  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, `${filtered.join("\n")}\n`);
  renameSync(tempPath, filePath);
}
