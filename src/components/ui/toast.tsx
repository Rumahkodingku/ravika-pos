"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Tone } from "@/types/ui";

type ToastTone = Extract<Tone, "success" | "warning" | "danger" | "info">;

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastItem = ToastInput & {
  id: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

const toneClasses: Record<ToastTone, string> = {
  success: "border-success/30 bg-surface-elevated",
  warning: "border-warning/30 bg-surface-elevated",
  danger: "border-danger/30 bg-surface-elevated",
  info: "border-info/30 bg-surface-elevated",
};

const iconClasses: Record<ToastTone, string> = {
  success: "text-success-strong",
  warning: "text-warning-strong",
  danger: "text-danger-strong",
  info: "text-info-strong",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;
      const item: ToastItem = { ...input, id };

      setToasts((current) => [...current.slice(-2), item]);

      window.setTimeout(() => dismiss(id), input.duration ?? 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[var(--z-toast)] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6"
      >
        {toasts.map((item) => {
          const tone = item.tone ?? "info";
          const Icon = icons[tone];

          return (
            <div
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-3 shadow-overlay",
                toneClasses[tone],
              )}
              key={item.id}
              role={tone === "danger" ? "alert" : "status"}
            >
              <Icon
                aria-hidden="true"
                className={cn("mt-0.5 h-5 w-5 shrink-0", iconClasses[tone])}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-body font-medium text-foreground">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="text-caption text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <Button
                aria-label="Tutup notifikasi"
                className="-mr-1 -mt-1 h-8 w-8 shrink-0 text-foreground"
                onClick={() => dismiss(item.id)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
