import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns parsed JSON data", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "order-1" }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    await expect(apiFetch("/orders/order-1")).resolves.toEqual({
      id: "order-1",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/orders/order-1",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/auth/logout", { method: "POST" })).resolves.toBe(
      undefined,
    );
  });

  it("throws ApiError from Problem Details", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "urn:ravika:problem:validation-failed",
          title: "Validasi gagal",
          status: 400,
          detail: "Request tidak valid.",
          code: "VALIDATION_FAILED",
          errors: [{ path: "name", message: "Wajib diisi." }],
        }),
        {
          headers: { "content-type": "application/problem+json" },
          status: 400,
        },
      ),
    );

    const error = await apiFetch("/products").catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw error;
    }

    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.detail).toBe("Request tidak valid.");
    expect(error.errors).toEqual([{ path: "name", message: "Wajib diisi." }]);
  });

  it("dispatches ravika:unauthorized when a request returns 401", async () => {
    const listener = vi.fn();
    window.addEventListener("ravika:unauthorized", listener);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 401,
          detail: "Session tidak ditemukan.",
          code: "AUTH_SESSION_REQUIRED",
        }),
        {
          headers: { "content-type": "application/problem+json" },
          status: 401,
        },
      ),
    );

    await expect(apiFetch("/auth/me")).rejects.toBeInstanceOf(ApiError);
    window.removeEventListener("ravika:unauthorized", listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("JSON encodes object bodies with content-type", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    await apiFetch("/auth/login", {
      body: { identity: "owner", password: "secret", remember: true },
      method: "POST",
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(init.body).toBe(
      JSON.stringify({
        identity: "owner",
        password: "secret",
        remember: true,
      }),
    );
    expect(init.credentials).toBe("same-origin");
  });
});
