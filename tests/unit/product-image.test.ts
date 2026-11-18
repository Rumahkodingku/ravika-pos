import { describe, expect, it } from "vitest";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  validateProductImage,
} from "@/modules/catalog/product-image.service";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

describe("validateProductImage", () => {
  it("accepts JPEG, PNG, and WebP signatures", () => {
    expect(validateProductImage(jpeg, "image/jpeg")).toBe("image/jpeg");
    expect(validateProductImage(png, "image/png")).toBe("image/png");
    expect(validateProductImage(webp, "image/webp")).toBe("image/webp");
  });

  it("rejects unsupported MIME types", () => {
    expect(() => validateProductImage(png, "image/svg+xml")).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );
  });

  it("rejects spoofed content", () => {
    expect(() => validateProductImage(jpeg, "image/png")).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );
  });

  it("rejects empty and oversized images", () => {
    expect(() => validateProductImage(new Uint8Array(), "image/jpeg")).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );

    const oversized = new Uint8Array(PRODUCT_IMAGE_MAX_BYTES + 1);
    oversized.set(jpeg);

    expect(() => validateProductImage(oversized, "image/jpeg")).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );
  });
});
