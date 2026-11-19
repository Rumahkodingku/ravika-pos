import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import { getBackupFile } from "@/modules/backup/backup.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const auth = await requireAuth();
  requirePermission(auth, "backup.create");

  const { id } = await context.params;
  const { db } = await getDb();
  const file = await getBackupFile(db, auth.businessId, id, auth.userId);
  const stream = Readable.toWeb(createReadStream(file.filePath));

  return new Response(stream as ReadableStream, {
    headers: {
      "cache-control": "no-store",
      "content-disposition": `attachment; filename="${file.fileName}"`,
      "content-length": String(file.fileSize),
      "content-type": "application/octet-stream",
    },
  });
});
