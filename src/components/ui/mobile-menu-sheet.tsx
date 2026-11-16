"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Outlet } from "@/types/auth";
import type { NavGroup, QuickAction } from "@/types/ui";

export function MobileMenuSheet({
  activePath,
  groups,
  onOpenChange,
  onOutletChange,
  open,
  outlets,
  quickActions,
  selectedOutletId,
}: {
  activePath: string;
  groups: NavGroup[];
  onOpenChange: (open: boolean) => void;
  onOutletChange: (outletId: string) => void;
  open: boolean;
  outlets: Outlet[];
  quickActions: QuickAction[];
  selectedOutletId: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const outletId = useId();

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
      aria-labelledby={titleId}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none rounded-none border-0 bg-background p-0 text-foreground open:flex open:flex-col"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
      onClose={() => onOpenChange(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      }}
      ref={dialogRef}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-foreground">
            RAVIKA
          </span>
          <span className="text-caption font-semibold text-primary-strong">
            POS
          </span>
        </div>
        <Button
          aria-label="Tutup menu"
          onClick={() => onOpenChange(false)}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <h2 className="sr-only" id={titleId}>
          Menu utama
        </h2>

        <div className="mb-5 flex flex-col gap-1.5">
          <label
            className="text-label font-medium text-foreground"
            htmlFor={outletId}
          >
            Outlet aktif
          </label>
          <Select
            id={outletId}
            onChange={(event) => onOutletChange(event.target.value)}
            value={selectedOutletId}
          >
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </Select>
        </div>

        <section className="flex flex-col gap-2">
          <p className="text-label font-semibold text-foreground">Aksi cepat</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;

              return (
                <Link
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-label font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
                    index === 0
                      ? "border-primary-action bg-primary-action text-primary-action-foreground hover:bg-primary-action/90"
                      : "bg-surface text-foreground",
                  )}
                  href={action.href}
                  key={action.href}
                  onClick={() => onOpenChange(false)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <nav
          aria-label="Menu management"
          className="mt-6 grid gap-5 sm:grid-cols-2"
        >
          {groups.map((group) => (
            <section className="flex flex-col gap-1.5" key={group.label}>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-label font-semibold text-foreground">
                  {group.label}
                </h3>
                {group.description ? (
                  <p className="text-caption text-muted-foreground">
                    {group.description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === activePath;

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-md px-2 py-1.5 text-label text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
                        active && "bg-surface-subtle text-foreground",
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={() => onOpenChange(false)}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active && "text-primary-strong",
                        )}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-caption text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-caption text-muted-foreground">
          Menu mengikuti izin pengguna.
        </p>
      </div>
    </dialog>
  );
}
