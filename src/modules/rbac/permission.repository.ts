import "server-only";

import { eq, inArray } from "drizzle-orm";
import { permissions, rolePermissions } from "@/infrastructure/database/schema";
import type { DbExecutor } from "@/infrastructure/database/types";

export async function listPermissionCodesForRole(
  db: DbExecutor,
  roleId: string,
) {
  const links = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));

  if (links.length === 0) {
    return [];
  }

  const rows = await db
    .select({ code: permissions.code })
    .from(permissions)
    .where(
      inArray(
        permissions.id,
        links.map((link) => link.permissionId),
      ),
    );

  return rows.map((row) => row.code);
}
