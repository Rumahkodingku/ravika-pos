"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "ravika-restart-required";
const HEALTH_INTERVAL_MS = 3000;

type RestartRequiredContextValue = {
  restartRequired: boolean;
  requireRestart: () => void;
};

const RestartRequiredContext =
  createContext<RestartRequiredContextValue | null>(null);

function RestartScreen() {
  return (
    <div
      aria-labelledby="restart-title"
      aria-modal="true"
      className="fixed inset-0 z-[var(--z-toast)] flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      role="alertdialog"
    >
      <Loader2
        aria-hidden="true"
        className="h-8 w-8 animate-spin text-primary-strong motion-reduce:animate-none"
      />
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-page-title text-foreground" id="restart-title">
          Restart diperlukan
        </h1>
        <p className="text-body text-muted-foreground">
          Restore selesai dan database sudah diganti. Server perlu dimulai ulang
          sebelum aplikasi dapat dipakai lagi.
        </p>
        <p className="text-caption text-muted-foreground">
          Aplikasi akan memuat ulang otomatis setelah server aktif.
        </p>
      </div>
    </div>
  );
}

export function RestartRequiredProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [restartRequired, setRestartRequired] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      setRestartRequired(true);
    }
  }, []);

  const requireRestart = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setRestartRequired(true);
  }, []);

  useEffect(() => {
    if (!restartRequired) {
      return;
    }

    void queryClient.cancelQueries();
    queryClient.clear();

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });

        if (response.ok) {
          if (stopped) {
            return;
          }
          window.localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
          return;
        }
      } catch {
        // Keep polling until the restarted server answers.
      }

      if (!stopped) {
        timer = setTimeout(poll, HEALTH_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [queryClient, restartRequired]);

  const value = useMemo(
    () => ({ requireRestart, restartRequired }),
    [requireRestart, restartRequired],
  );

  return (
    <RestartRequiredContext.Provider value={value}>
      {restartRequired ? <RestartScreen /> : children}
    </RestartRequiredContext.Provider>
  );
}

export function useRestartRequired() {
  const context = useContext(RestartRequiredContext);

  if (!context) {
    throw new Error(
      "useRestartRequired must be used within RestartRequiredProvider",
    );
  }

  return context;
}
