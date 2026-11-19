import { requireAuth } from "@/modules/auth/session";
import { getNetworkStatus } from "@/modules/network/network.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  const context = await requireAuth();
  requirePermission(context, "settings.manage");

  return json(await getNetworkStatus());
});
