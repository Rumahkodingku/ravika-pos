/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { compressProductImage } from "@/lib/image";

describe("compressProductImage", () => {
  it("rejects unsupported file types before reading pixels", async () => {
    const file = new File([new Uint8Array([1])], "vector.svg", {
      type: "image/svg+xml",
    });

    await expect(compressProductImage(file)).rejects.toThrow(
      "Gambar harus JPEG, PNG, atau WebP.",
    );
  });
});
