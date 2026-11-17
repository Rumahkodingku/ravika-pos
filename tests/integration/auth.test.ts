import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import {
  changePassword,
  login,
  logout,
  resolveSession,
} from "@/modules/auth/auth.service";
import type { AppError } from "@/shared/errors/app-error";
import { hashToken } from "@/shared/ids";
import { createTestDatabase } from "../helpers/test-db";

let bundle: DatabaseBundle;

beforeEach(async () => {
  bundle = await createTestDatabase();
});

afterEach(() => {
  bundle.close();
});

async function loginOwner() {
  return login(
    bundle.db,
    {
      identity: "owner@ravika.id",
      password: "demo123",
      remember: false,
    },
    "127.0.0.1",
  );
}

describe("auth", () => {
  it("logs in with email and username", async () => {
    const byEmail = await loginOwner();
    const byUsername = await login(
      bundle.db,
      { identity: "owner", password: "demo123", remember: false },
      "127.0.0.2",
    );

    expect(byEmail.user.email).toBe("owner@ravika.id");
    expect(byUsername.user.username).toBe("owner");
  });

  it("rejects wrong credentials with a generic error", async () => {
    await expect(
      login(
        bundle.db,
        { identity: "owner@ravika.id", password: "salah", remember: false },
        "127.0.0.3",
      ),
    ).rejects.toMatchObject({
      code: "AUTH_INVALID_CREDENTIALS",
      status: 401,
    } satisfies Partial<AppError>);
  });

  it("rejects inactive users", async () => {
    bundle.sqlite
      .prepare("update users set is_active = 0 where email = ?")
      .run("cashier@ravika.id");

    await expect(
      login(
        bundle.db,
        { identity: "cashier@ravika.id", password: "demo123", remember: false },
        "127.0.0.4",
      ),
    ).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("resolves, expires, revokes, and logs out sessions", async () => {
    const result = await loginOwner();
    const valid = await resolveSession(bundle.db, result.token);

    expect(valid.status).toBe("valid");

    bundle.sqlite
      .prepare("update sessions set expires_at = ? where token_hash = ?")
      .run(Date.now() - 1000, hashToken(result.token));

    expect(await resolveSession(bundle.db, result.token)).toEqual({
      status: "expired",
    });

    const second = await loginOwner();
    await logout(bundle.db, second.token);

    expect(await resolveSession(bundle.db, second.token)).toEqual({
      status: "revoked",
    });
  });

  it("changes password and revokes other sessions", async () => {
    const first = await loginOwner();
    const second = await loginOwner();
    const context = await resolveSession(bundle.db, first.token);

    if (context.status !== "valid") {
      throw new Error("Expected valid session");
    }

    await changePassword(bundle.db, context.context, {
      currentPassword: "demo123",
      newPassword: "password-baru",
    });

    expect(await resolveSession(bundle.db, second.token)).toEqual({
      status: "revoked",
    });

    await expect(
      login(
        bundle.db,
        { identity: "owner", password: "demo123", remember: false },
        "127.0.0.5",
      ),
    ).rejects.toMatchObject({ code: "AUTH_INVALID_CREDENTIALS" });

    const relogin = await login(
      bundle.db,
      { identity: "owner", password: "password-baru", remember: false },
      "127.0.0.6",
    );

    expect(relogin.user.email).toBe("owner@ravika.id");
  });
});
