import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const N = 16384;
const R = 8;
const P = 1;

function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH, {
    N,
    r: R,
    p: P,
  });

  return [
    "scrypt",
    N,
    R,
    P,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, n, r, p, salt, hash] = stored.split("$");

  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(
    password,
    Buffer.from(salt, "base64url"),
    expected.length,
    { N: Number(n), r: Number(r), p: Number(p) },
  );

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
