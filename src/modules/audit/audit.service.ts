import "server-only";

import { auditLogs } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";
import { newId } from "@/shared/ids";
import { stableStringify } from "@/shared/stable-json";
import { now } from "@/shared/time";

export async function writeAudit(
  db: DbExecutor,
  input: {
    businessId: string;
    actorUserId?: string | null;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(auditLogs).values({
    id: newId(),
    businessId: input.businessId,
    actorUserId: input.actorUserId ?? null,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    metadata: stableStringify(input.metadata ?? {}),
    createdAt: now(),
  });
}
