function firstHeader(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host =
    firstHeader(request.headers.get("x-forwarded-host")) ??
    request.headers.get("host") ??
    url.host;
  const protocol =
    firstHeader(request.headers.get("x-forwarded-proto")) ??
    url.protocol.replace(":", "");

  return host ? `${protocol}://${host}` : null;
}
