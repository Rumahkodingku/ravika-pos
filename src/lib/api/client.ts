import { ApiError } from "@/lib/api/errors";

export type ApiRequestInit = Omit<RequestInit, "body"> & { body?: unknown };

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("json");
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const { body, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("accept", "application/json");

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData || body instanceof Blob) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("content-type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      ...rest,
      body: requestBody,
      credentials: "same-origin",
      headers: requestHeaders,
    });
  } catch {
    throw ApiError.network();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const problem = isJsonResponse(response)
      ? await response.json().catch(() => null)
      : null;

    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("ravika:unauthorized"));
    }

    throw ApiError.fromResponse(response.status, problem);
  }

  return (isJsonResponse(response) ? await response.json() : undefined) as T;
}
