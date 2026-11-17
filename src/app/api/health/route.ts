import { getDb } from "@/infrastructure/database/client";
import { getHealth } from "@/modules/health/health.service";
import { AppError } from "@/shared/errors/app-error";
import { json, withApi } from "@/shared/http/route-handler";
import { logger } from "@/shared/logging/logger";

export const GET = withApi(async () => {
  try {
    const { db } = await getDb();
    return json(await getHealth(db));
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw AppError.unavailable();
  }
});
