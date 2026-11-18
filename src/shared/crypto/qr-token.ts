import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const VERSION = "v1";
const NONCE_BYTES = 12;

function key() {
  const configured = process.env.RAVIKA_QR_TOKEN_KEY;

  if (configured) {
    const value = Buffer.from(configured, "base64");

    if (value.length !== 32) {
      throw new Error("RAVIKA_QR_TOKEN_KEY must be 32 bytes base64.");
    }

    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("RAVIKA_QR_TOKEN_KEY is required in production.");
  }

  // shortcut: fixed development key keeps local QR usable; production must set the env key.
  return createHash("sha256").update("ravika-dev-qr-token-key").digest();
}

export function encryptQrToken(tableId: string, token: string) {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), nonce);
  cipher.setAAD(Buffer.from(tableId));

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  return [
    VERSION,
    nonce.toString("base64url"),
    encrypted.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
  ].join(".");
}

export function decryptQrToken(tableId: string, ciphertext: string) {
  const [version, nonce, encrypted, tag] = ciphertext.split(".");

  if (version !== VERSION || !nonce || !encrypted || !tag) {
    throw new Error("Format ciphertext QR tidak valid.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(nonce, "base64url"),
  );
  decipher.setAAD(Buffer.from(tableId));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
