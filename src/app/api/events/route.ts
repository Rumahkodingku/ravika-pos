import { requireAuth } from "@/modules/auth/session";
import {
  type RealtimeEvent,
  subscribeRealtime,
} from "@/modules/events/event-bus";
import { requirePermission } from "@/modules/rbac/authorization";
import { withApi } from "@/shared/http/route-handler";

const HEARTBEAT_MS = 15_000;

export const GET = withApi(async (request) => {
  const context = await requireAuth();
  requirePermission(context, "kds.view");

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let timer: ReturnType<typeof setInterval> | undefined;
      const write = (chunk: string) => {
        if (closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        if (timer) {
          clearInterval(timer);
        }
        unsubscribe();

        try {
          controller.close();
        } catch {
          // stream already closed by the client
        }
      };
      const unsubscribe = subscribeRealtime((event: RealtimeEvent) => {
        write(
          `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(
            event.data,
          )}\nretry: 3000\n\n`,
        );
      });

      write("retry: 3000\n\n");
      timer = setInterval(() => write(": ping\n\n"), HEARTBEAT_MS);
      request.signal.addEventListener("abort", close);
      cleanup = close;
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
});
