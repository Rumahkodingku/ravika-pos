import { z } from "zod";
import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { restoreBackup } from "@/modules/backup/backup.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, parseJson, withApi } from "@/shared/http/route-handler";

const restoreSchema = z
  .object({
    backupId: z.string().min(1),
    confirm: z.boolean(),
  })
  .strict();

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "backup.restore");

  const input = await parseJson(request, restoreSchema);
  const bundle = await getDb();

  return json(
    await restoreBackup(
      bundle.db,
      bundle,
      context.businessId,
      input,
      context.userId,
    ),
  );
});
