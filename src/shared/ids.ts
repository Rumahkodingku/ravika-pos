import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";

export function newId() {
  return randomUUID();
}

export function newToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
