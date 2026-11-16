"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const sideClasses = {
  left: "inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-full max-w-sm rounded-none border-y-0 border-l-0",
  right:
    "inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-sm rounded-none border-y-0 border-r-0",
  bottom:
    "inset-x-0 bottom-0 top-auto m-0 w-full max-h-[85dvh] rounded-b-none rounded-t-xl border-x-0 border-b-0",
};

export function Drawer({
  children,
  className,
  description,
  footer,
  onOpenChange,
  open,
  side = "right",
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  side?: keyof typeof sideClasses;
  title: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={cn(
        "fixed border border-border bg-surface p-0 text-foreground shadow-overlay open:flex open:flex-col",
        sideClasses[side],
        className,
      )}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      }}
      onClose={() => onOpenChange(false)}
      ref={dialogRef}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-section-title text-foreground" id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className="text-body text-muted-foreground" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        <Button
          aria-label="Tutup panel"
          onClick={() => onOpenChange(false)}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-border p-5">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
