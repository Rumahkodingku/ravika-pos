import type { ZodType } from "zod";
import { AppError } from "@/shared/errors/app-error";
import { problemResponse } from "@/shared/http/problem-details";
import { logger } from "@/shared/logging/logger";

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

export function noContent() {
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw AppError.validation([
      { path: "body", message: "Body JSON tidak valid." },
    ]);
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw AppError.validation(
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  return parsed.data;
}

type RouteContext = Record<string, unknown>;

type Handler<TContext extends RouteContext> = (
  request: Request,
  context: TContext & { requestId: string },
) => Promise<Response>;

export function withApi<TContext extends RouteContext = RouteContext>(
  handler: Handler<TContext>,
) {
  return async (request: Request, context?: TContext) => {
    const requestId =
      request.headers.get("x-request-id") ?? crypto.randomUUID();
    const startedAt = performance.now();
    let status = 500;

    try {
      const response = await handler(request, {
        ...(context ?? ({} as TContext)),
        requestId,
      });
      status = response.status;
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      status = error instanceof AppError ? error.status : 500;
      const response = problemResponse(error);
      response.headers.set("x-request-id", requestId);

      if (!(error instanceof AppError)) {
        logger.error("Unhandled API error", {
          requestId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      return response;
    } finally {
      logger.info("API request", {
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status,
        durationMs: Math.round(performance.now() - startedAt),
      });
    }
  };
}
