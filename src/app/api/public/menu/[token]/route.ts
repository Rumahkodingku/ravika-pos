import { getDb } from "@/infrastructure/database/client";
import { getPublicMenu } from "@/modules/tables/table.service";
import { AppError } from "@/shared/errors/app-error";
import { getClientIp } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

type Context = { params: Promise<{ token: string }> };

export const GET = withApi<Context>(async (request, context) => {
  if (!consumeRateLimit(`public-menu:${getClientIp(request)}`, 60, 60_000)) {
    throw AppError.rateLimited();
  }

  const { token } = await context.params;
  const { db } = await getDb();

  return json(await getPublicMenu(db, token));
});
