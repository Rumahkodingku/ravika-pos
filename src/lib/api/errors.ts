import type { ValidationIssue } from "@/types/api";

const fallbackDetail = "Terjadi kesalahan. Coba lagi.";

export class ApiError extends Error {
  readonly code: string;
  readonly detail: string;
  readonly errors?: ValidationIssue[];
  readonly status: number;

  constructor(input: {
    code: string;
    detail: string;
    status: number;
    errors?: ValidationIssue[];
  }) {
    super(input.detail);
    this.name = "ApiError";
    this.code = input.code;
    this.detail = input.detail;
    this.errors = input.errors;
    this.status = input.status;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  static network() {
    return new ApiError({
      code: "NETWORK_ERROR",
      detail: "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      status: 0,
    });
  }

  static fromResponse(status: number, body: unknown) {
    const problem =
      body && typeof body === "object"
        ? (body as {
            code?: unknown;
            detail?: unknown;
            errors?: unknown;
          })
        : null;

    return new ApiError({
      code: typeof problem?.code === "string" ? problem.code : "HTTP_ERROR",
      detail:
        typeof problem?.detail === "string" && problem.detail.length > 0
          ? problem.detail
          : fallbackDetail,
      errors: Array.isArray(problem?.errors)
        ? (problem.errors as ValidationIssue[])
        : undefined,
      status,
    });
  }
}
