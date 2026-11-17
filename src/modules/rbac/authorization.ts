import "server-only";

import type { AuthContext } from "@/modules/auth/auth.service";
import { AppError } from "@/shared/errors/app-error";

export function hasPermission(context: AuthContext, permission: string) {
  return context.permissions.includes(permission);
}

export function requirePermission(context: AuthContext, permission: string) {
  if (!hasPermission(context, permission)) {
    throw AppError.forbidden();
  }
}
