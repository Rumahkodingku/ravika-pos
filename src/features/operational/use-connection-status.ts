"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/components/feedback/connection-indicator";

function browserStatus(): ConnectionStatus {
  if (typeof navigator === "undefined" || navigator.onLine) {
    return "connected";
  }

  return "disconnected";
}

export function useConnectionStatus(): ConnectionStatus {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>(browserStatus);

  useEffect(() => {
    let active = true;

    const handleOffline = () => setStatus("disconnected");
    const handleOnline = () => {
      setStatus("reconnecting");
      queryClient.invalidateQueries({ refetchType: "active" }).finally(() => {
        if (active) {
          setStatus("connected");
        }
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      active = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [queryClient]);

  return status;
}
