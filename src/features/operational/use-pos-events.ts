"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { ConnectionStatus } from "@/components/feedback/connection-indicator";
import { useToast } from "@/components/ui/toast";

const SOUND_KEY = "ravika-pos-order-sound";

type OrderCreatedEvent = {
  source?: string;
  orderNumber?: string;
  tableName?: string | null;
};

function speakNewOrder() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    document.visibilityState !== "visible"
  ) {
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance("Pesanan Baru Masuk");
    utterance.lang = "id-ID";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Best effort. Toast remains as the fallback.
  }
}

export function usePosEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const [online, setOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    setSoundEnabled(window.localStorage.getItem(SOUND_KEY) !== "0");
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

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

    const invalidateOrders = () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["tables"] });
    };

    const handleCreated = (event: MessageEvent) => {
      invalidateOrders();

      let data: OrderCreatedEvent;

      try {
        data = JSON.parse(event.data) as OrderCreatedEvent;
      } catch {
        return;
      }

      if (data.source !== "QR") {
        return;
      }

      toast({
        title: "Pesanan Baru Masuk",
        description: [data.orderNumber, data.tableName]
          .filter(Boolean)
          .join(" - "),
        tone: "success",
      });

      if (soundEnabledRef.current) {
        speakNewOrder();
      }
    };

    source.onopen = () => {
      setStatus("connected");

      if (hadError) {
        hadError = false;
        invalidateOrders();
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

    source.addEventListener("order.created", handleCreated);

    for (const type of [
      "order.status_changed",
      "payment.status_changed",
      "order.refunded",
    ]) {
      source.addEventListener(type, invalidateOrders);
    }

    return () => {
      source.close();
    };
  }, [queryClient, toast]);

  const toggleSound = () => {
    setSoundEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      return next;
    });
  };

  return {
    soundEnabled,
    status: online ? status : "disconnected",
    toggleSound,
  };
}
