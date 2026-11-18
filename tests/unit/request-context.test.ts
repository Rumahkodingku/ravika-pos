import { describe, expect, it } from "vitest";
import { assertSameOrigin } from "@/shared/http/request-context";

describe("assertSameOrigin", () => {
  it("accepts an origin that matches the request host", () => {
    const request = new Request("http://localhost:3200/api/auth/login", {
      headers: {
        host: "192.168.1.10:3200",
        origin: "http://192.168.1.10:3200",
      },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("rejects a different origin", () => {
    const request = new Request("http://localhost:3200/api/auth/login", {
      headers: {
        host: "192.168.1.10:3200",
        origin: "http://evil.example",
      },
    });

    expect(() => assertSameOrigin(request)).toThrow(
      expect.objectContaining({ code: "ORIGIN_FORBIDDEN" }),
    );
  });
});
