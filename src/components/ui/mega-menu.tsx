"use client";

import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { NavGroup, QuickAction } from "@/types/ui";

function MegaMenuGroup({
  activePath,
  group,
  onNavigate,
}: {
  activePath: string;
  group: NavGroup;
  onNavigate: () => void;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-label font-semibold text-foreground">
          {group.label}
        </h2>
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
                "group flex min-h-11 items-start gap-3 rounded-md px-2.5 py-2 transition-colors duration-[var(--motion-fast)] ease-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none",
                active && "bg-surface-subtle",
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground",
                  active &&
                    "border-primary/30 bg-primary/10 text-primary-strong",
                )}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-caption text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function MegaMenu({
  activePath,
  className,
  groups,
  quickActions,
}: {
  activePath: string;
  className?: string;
  groups: NavGroup[];
  quickActions: QuickAction[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (activePath) {
      setOpen(false);
    }
  }, [activePath]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const groupColumns = [
    groups.slice(0, 2),
    groups.slice(2, 4),
    groups.slice(4),
  ];

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-label font-medium text-muted-foreground transition-colors duration-[var(--motion-fast)] ease-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
          open && "bg-muted text-foreground",
        )}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <LayoutGrid aria-hidden="true" className="h-[18px] w-[18px]" />
        Menu
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform duration-[var(--motion-fast)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <nav
          aria-label="Menu utama"
          className="mega-menu-panel fixed left-1/2 top-[calc(var(--ravika-header-height)+0.5rem)] z-[var(--z-dropdown)] w-[min(1180px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-overlay"
          id={panelId}
          ref={panelRef}
        >
          <div className="grid max-h-[min(72dvh,620px)] gap-6 overflow-y-auto p-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:p-6">
            {groupColumns.map((column) => (
              <div
                className="flex min-w-0 flex-col gap-5"
                key={column[0]?.label ?? "group-column"}
              >
                {column.map((group) => (
                  <MegaMenuGroup
                    activePath={activePath}
                    group={group}
                    key={group.label}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </div>
            ))}

            <section className="flex min-w-0 flex-col gap-3 self-start rounded-lg border border-border bg-surface-subtle p-3">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-label font-semibold text-foreground">
                  Aksi cepat
                </h2>
                <p className="text-caption text-muted-foreground">
                  Langsung ke pekerjaan yang sering dipakai.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      className={buttonVariants({
                        variant: index === 0 ? "primary" : "outline",
                        size: "sm",
                        className: "h-11 justify-start",
                      })}
                      href={action.href}
                      key={action.href}
                      onClick={() => setOpen(false)}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
            <p className="text-caption text-muted-foreground">
              Menu mengikuti izin pengguna.
            </p>
            <p className="text-caption text-muted-foreground">
              Tekan Esc untuk menutup.
            </p>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
