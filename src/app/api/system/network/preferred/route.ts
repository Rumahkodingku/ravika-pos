import { z } from "zod";
import { getDb } from "@/infrastructure/database/client";
import { writeAudit } from "@/modules/audit/audit.service";
import { requireAuth } from "@/modules/auth/session";
import { setPreferredInterface } from "@/modules/network/network.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { AppError } from "@/shared/errors/app-error";
import { assertSameOrigin, getClientIp } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

const preferredSchema = z.object({ interfaceId: z.string().min(1) }).strict();

export const PATCH = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "settings.manage");

  if (
    !consumeRateLimit(`network-preferred:${getClientIp(request)}`, 10, 60_000)
  ) {
    throw AppError.rateLimited();
  }

  const input = await parseJson(request, preferredSchema);
  const status = await setPreferredInterface(input.interfaceId);
  const { db } = await getDb();

  await writeAudit(db, {
    action: "network.preferred_interface",
    actorUserId: context.userId,
    businessId: context.businessId,
    metadata: { interfaceId: input.interfaceId },
    resourceId: "network",
    resourceType: "network",
  });

  return json(status);
});
