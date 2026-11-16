"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function ConfirmDialog({
  cancelLabel = "Batal",
  confirmLabel = "Lanjutkan",
  consequence,
  description,
  isLoading = false,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = "danger",
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  consequence?: React.ReactNode;
  description: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: React.ReactNode;
  tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      description={description}
      footer={
        <>
          <Button
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            isLoading={isLoading}
            onClick={onConfirm}
            variant={tone === "danger" ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title={title}
    >
      {consequence ? (
        <p className="rounded-md border border-warning/30 bg-warning-subtle px-3 py-2 text-body text-warning-strong">
          {consequence}
        </p>
      ) : null}
    </Dialog>
  );
}
