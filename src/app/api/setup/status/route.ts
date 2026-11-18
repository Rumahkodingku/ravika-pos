import { getDb } from "@/infrastructure/database/client";
import { getSetupStatus } from "@/modules/setup/setup.service";
import { AppError } from "@/shared/errors/app-error";
import { getClientIp } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

export const GET = withApi(async (request) => {
  if (!consumeRateLimit(`setup-status:${getClientIp(request)}`, 30, 60_000)) {
    throw AppError.rateLimited();
  }

  const { db } = await getDb();

  return json(await getSetupStatus(db));
});
