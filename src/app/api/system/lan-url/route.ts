import { requireAuth } from "@/modules/auth/session";
import { getPreferredLanUrl } from "@/modules/network/network.service";
import { json, withApi } from "@/shared/http/route-handler";

function isLocalHost(host: string) {
  const hostname = host.replace(/:\d+$/, "").toLowerCase();

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

export const GET = withApi(async (request) => {
  await requireAuth();

  const lanUrl = await getPreferredLanUrl();

  if (lanUrl) {
    return json({ url: lanUrl.replace(/\/$/, "") });
  }

  const origin = new URL(request.url).origin;

  return json({ url: isLocalHost(new URL(origin).host) ? null : origin });
});
