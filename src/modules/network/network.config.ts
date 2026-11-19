import "server-only";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { networkConfigPath } from "@/shared/paths";

type NetworkConfig = {
  preferredInterface?: string;
};

export function readNetworkConfig(): NetworkConfig {
  const file = networkConfigPath();

  if (!existsSync(file)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as NetworkConfig;

    return typeof parsed.preferredInterface === "string"
      ? { preferredInterface: parsed.preferredInterface }
      : {};
  } catch {
    return {};
  }
}

export function writeNetworkConfig(config: NetworkConfig) {
  const file = networkConfigPath();
  const temp = `${file}.tmp`;

  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(temp, `${JSON.stringify(config, null, 2)}\n`);
  renameSync(temp, file);
}
