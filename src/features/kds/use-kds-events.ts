"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/components/feedback/connection-indicator";
import { queryKeys } from "@/lib/api/keys";

const eventTypes = [
  "order.created",
  "order.status_changed",
  "payment.status_changed",
  "order.refunded",
] as const;

export function useKdsEvents(): { status: ConnectionStatus } {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    let hadError = false;
    const source = new EventSource("/api/events");

    const invalidateKds = () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kds });
    };

    source.onopen = () => {
      setStatus("connected");

      if (hadError) {
        hadError = false;
        invalidateKds();
      }
    };

    source.onerror = () => {
      hadError = true;
      setStatus(
        source.readyState === EventSource.CLOSED
          ? "disconnected"
          : "reconnecting",
      );
    };

    source.onmessage = invalidateKds;

    for (const type of eventTypes) {
      source.addEventListener(type, invalidateKds);
    }

    return () => {
      source.close();
    };
  }, [queryClient]);

  return { status: online ? status : "disconnected" };
}
