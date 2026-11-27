import { getDb } from "@/infrastructure/database/client";
import { getPreferredLanUrl } from "@/modules/network/network.service";
import { setupSchema } from "@/modules/setup/setup.schemas";
import { runSetup } from "@/modules/setup/setup.service";
import { AppError } from "@/shared/errors/app-error";
import { assertSameOrigin, getClientIp } from "@/shared/http/request-context";
import { requestOrigin } from "@/shared/http/request-origin";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { configFilePath } from "@/shared/paths";
import { consumeRateLimit } from "@/shared/rate-limit";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  if (!consumeRateLimit(`setup:${getClientIp(request)}`, 5, 60_000)) {
    throw AppError.rateLimited();
  }

  const input = await parseJson(request, setupSchema);
  const { db } = await getDb();
  const result = await runSetup(db, configFilePath(), input);
  const origin = requestOrigin(request);
  const redirectUrl = origin
    ? `${origin}/login`
    : await getPreferredLanUrl("/login");

  // The service wrapper restarts a failed process; dev mode stays alive.
  if (process.env.RAVIKA_SERVICE_RESTART === "1") {
    setTimeout(() => process.exit(1), 1000);
  }

  return json({ ...result, redirectUrl }, { status: 201 });
});
