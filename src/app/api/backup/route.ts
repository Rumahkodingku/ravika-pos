import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { createBackup, listBackups } from "@/modules/backup/backup.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "backup.create");

  const { db } = await getDb();

  return json(await listBackups(db));
});

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "backup.create");

  const bundle = await getDb();

  return json(await createBackup(bundle, context.businessId, context.userId), {
    status: 201,
  });
});
