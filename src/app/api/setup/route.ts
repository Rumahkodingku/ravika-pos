import { resolve } from "node:path";
import { getDb } from "@/infrastructure/database/client";
import { setupSchema } from "@/modules/setup/setup.schemas";
import { runSetup } from "@/modules/setup/setup.service";
import { AppError } from "@/shared/errors/app-error";
import { assertSameOrigin, getClientIp } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  if (!consumeRateLimit(`setup:${getClientIp(request)}`, 5, 60_000)) {
    throw AppError.rateLimited();
  }

  const input = await parseJson(request, setupSchema);
  const { db } = await getDb();

  return json(await runSetup(db, resolve(process.cwd(), ".env"), input), {
    status: 201,
  });
});
