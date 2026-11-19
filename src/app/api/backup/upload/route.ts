import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { uploadBackup } from "@/modules/backup/backup.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { AppError } from "@/shared/errors/app-error";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";

export const POST = withApi(async (request) => {
  assertSameOrigin(request);

  const context = await requireAuth();
  requirePermission(context, "backup.restore");

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    throw AppError.validation([
      { path: "file", message: "File backup wajib diunggah." },
    ]);
  }

  const { db } = await getDb();

  return json(
    await uploadBackup(db, context.businessId, context.userId, file),
    { status: 201 },
  );
});
