import { describe, expect, it } from "vitest";
import { AppError } from "@/shared/errors/app-error";
import {
  problemResponse,
  toProblemDetails,
} from "@/shared/http/problem-details";

describe("problem details", () => {
  it("formats validation errors as RFC 9457", () => {
    const problem = toProblemDetails(
      AppError.validation([{ path: "identity", message: "Wajib diisi." }]),
    );

    expect(problem).toEqual({
      type: "urn:ravika:problem:validation-failed",
      title: "Validasi gagal",
      status: 400,
      detail: "Request tidak valid.",
      code: "VALIDATION_FAILED",
      errors: [{ path: "identity", message: "Wajib diisi." }],
    });
  });

  it("hides unknown errors", async () => {
    const response = problemResponse(new Error("boom"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.detail).toBe("Terjadi kesalahan internal.");
  });
});
