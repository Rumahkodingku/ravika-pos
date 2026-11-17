import { AppError } from "@/shared/errors/app-error";
import type { ProblemDetails } from "@/types/api";

export function toProblemDetails(error: unknown): ProblemDetails {
  const appError = error instanceof AppError ? error : AppError.internal();

  return {
    type: `urn:ravika:problem:${appError.code.toLowerCase().replaceAll("_", "-")}`,
    title: appError.title,
    status: appError.status,
    detail: appError.detail,
    code: appError.code,
    ...(appError.errors ? { errors: appError.errors } : {}),
  };
}

export function problemResponse(error: unknown) {
  const problem = toProblemDetails(error);

  return new Response(JSON.stringify(problem), {
    status: problem.status,
    headers: {
      "content-type": "application/problem+json",
      "cache-control": "no-store",
    },
  });
}
