import { describe, expect, it } from "vitest";
import { requestOrigin } from "@/shared/http/request-origin";

describe("requestOrigin", () => {
  it("uses forwarded host and protocol from a reverse proxy", () => {
    const request = new Request("http://container:3000/setup", {
      headers: {
        "x-forwarded-host": "ravika.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(requestOrigin(request)).toBe("https://ravika.example.com");
  });

  it("falls back to the request host and protocol", () => {
    const request = new Request("http://192.168.1.10:3000/setup", {
      headers: { host: "192.168.1.10:3000" },
    });

    expect(requestOrigin(request)).toBe("http://192.168.1.10:3000");
  });

  it("uses the first forwarded value", () => {
    const request = new Request("http://container:3000/setup", {
      headers: {
        "x-forwarded-host": "ravika.example.com, proxy.internal",
        "x-forwarded-proto": "https, http",
      },
    });

    expect(requestOrigin(request)).toBe("https://ravika.example.com");
  });
});
