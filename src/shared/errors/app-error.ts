import type { ValidationIssue } from "@/types/api";

export class AppError extends Error {
  readonly code: string;
  readonly detail: string;
  readonly errors?: ValidationIssue[];
  readonly status: number;
  readonly title: string;

  constructor(input: {
    code: string;
    detail: string;
    status: number;
    title: string;
    errors?: ValidationIssue[];
  }) {
    super(input.detail);
    this.name = "AppError";
    this.code = input.code;
    this.detail = input.detail;
    this.errors = input.errors;
    this.status = input.status;
    this.title = input.title;
  }

  static validation(errors: ValidationIssue[]) {
    return new AppError({
      code: "VALIDATION_FAILED",
      detail: "Request tidak valid.",
      errors,
      status: 400,
      title: "Validasi gagal",
    });
  }

  static unauthorized(code: string, detail: string) {
    return new AppError({
      code,
      detail,
      status: 401,
      title: "Autentikasi gagal",
    });
  }

  static forbidden(code = "AUTH_FORBIDDEN", detail = "Akses ditolak.") {
    return new AppError({
      code,
      detail,
      status: 403,
      title: "Akses ditolak",
    });
  }

  static notFound(code: string, detail: string) {
    return new AppError({
      code,
      detail,
      status: 404,
      title: "Tidak ditemukan",
    });
  }

  static conflict(code: string, detail: string) {
    return new AppError({
      code,
      detail,
      status: 409,
      title: "Konflik data",
    });
  }

  static tooLarge(detail: string) {
    return new AppError({
      code: "PAYLOAD_TOO_LARGE",
      detail,
      status: 413,
      title: "File terlalu besar",
    });
  }

  static unprocessable(code: string, detail: string) {
    return new AppError({
      code,
      detail,
      status: 422,
      title: "Aturan bisnis tidak terpenuhi",
    });
  }

  static rateLimited() {
    return new AppError({
      code: "RATE_LIMITED",
      detail: "Terlalu banyak percobaan. Coba lagi nanti.",
      status: 429,
      title: "Terlalu banyak percobaan",
    });
  }

  static internal() {
    return new AppError({
      code: "INTERNAL_ERROR",
      detail: "Terjadi kesalahan internal.",
      status: 500,
      title: "Kesalahan internal",
    });
  }

  static unavailable() {
    return new AppError({
      code: "DATABASE_UNAVAILABLE",
      detail: "Database tidak siap.",
      status: 503,
      title: "Layanan tidak tersedia",
    });
  }
}
