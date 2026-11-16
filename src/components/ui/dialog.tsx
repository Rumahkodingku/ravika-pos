"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({
  children,
  className,
  closeOnBackdrop = true,
  description,
  footer,
  onOpenChange,
  open,
  size = "md",
  title,
}: {
  children?: ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  size?: keyof typeof sizeClasses;
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
        "fixed inset-0 m-auto w-[calc(100%-2rem)] rounded-xl border border-border bg-surface p-0 text-foreground shadow-overlay open:flex open:flex-col",
        sizeClasses[size],
        className,
      )}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (closeOnBackdrop && event.target === dialogRef.current) {
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
          aria-label="Tutup dialog"
          onClick={() => onOpenChange(false)}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>
      {children ? <div className="p-5">{children}</div> : null}
      {footer ? (
        <div className="flex items-center justify-end gap-2 border-t border-border p-5">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
