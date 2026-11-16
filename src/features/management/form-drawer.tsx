"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { ConfirmDialog } from "@/features/management/confirm-dialog";

export function FormDrawer({
  children,
  description,
  formId,
  isDirty = false,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
  submitLabel = "Simpan",
  title,
}: {
  children: React.ReactNode;
  description?: React.ReactNode;
  formId: string;
  isDirty?: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  open: boolean;
  submitLabel?: string;
  title: React.ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || confirmOpen) {
      return;
    }

    const drawer = document.querySelector("dialog[open]");
    const focusable = drawer?.querySelector<HTMLElement>(
      "input, select, textarea",
    );
    focusable?.focus();
  }, [confirmOpen, open]);

  const requestClose = () => {
    if (isDirty) {
      setConfirmOpen(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <Drawer
        description={description}
        footer={
          <>
            <Button
              disabled={isSubmitting}
              onClick={requestClose}
              variant="outline"
            >
              Batal
            </Button>
            <Button form={formId} isLoading={isSubmitting} type="submit">
              {submitLabel}
            </Button>
          </>
        }
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            onOpenChange(true);
            return;
          }
          if (!open) {
            onOpenChange(false);
            return;
          }
          requestClose();
        }}
        open={open}
        title={title}
      >
        <form
          className="flex flex-col gap-4"
          id={formId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              requestClose();
            }
          }}
          onSubmit={onSubmit}
        >
          {children}
        </form>
      </Drawer>

      <ConfirmDialog
        confirmLabel="Tutup tanpa menyimpan"
        description="Perubahan yang belum disimpan akan hilang."
        onConfirm={() => {
          setConfirmOpen(false);
          onOpenChange(false);
        }}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Tutup formulir?"
      />
    </>
  );
}
