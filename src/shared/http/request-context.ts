import { AppError } from "@/shared/errors/app-error";

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  return forwarded?.split(",")[0]?.trim() || "local";
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const host = request.headers.get("host");

  if (!host || new URL(origin).host !== host) {
    throw AppError.forbidden(
      "ORIGIN_FORBIDDEN",
      "Origin request tidak diizinkan.",
    );
  }
}
