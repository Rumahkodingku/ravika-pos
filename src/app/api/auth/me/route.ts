import { getSessionUser } from "@/modules/auth/session";
import { json, withApi } from "@/shared/http/route-handler";

export const GET = withApi(async () => {
  return json(await getSessionUser());
});
