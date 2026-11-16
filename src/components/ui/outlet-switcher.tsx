"use client";

import { Check, ChevronDown, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { Outlet } from "@/types/auth";

export function OutletSwitcher({
  onChange,
  outlets,
  value,
}: {
  onChange: (outletId: string) => void;
  outlets: Outlet[];
  value: string;
}) {
  const activeOutlet =
    outlets.find((outlet) => outlet.id === value) ?? outlets[0];

  if (!activeOutlet) {
    return null;
  }

  if (outlets.length <= 1) {
    return (
      <div
        className="hidden min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-label font-medium text-foreground sm:flex"
        title="Hanya satu outlet"
      >
        <Store aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        <span className="max-w-40 truncate">{activeOutlet.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu
      size="md"
      trigger={
        <>
          <Store aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-40 truncate">{activeOutlet.name}</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </>
      }
      variant="outline"
    >
      <DropdownMenuLabel>Outlet aktif</DropdownMenuLabel>
      {outlets.map((outlet) => (
        <DropdownMenuItem key={outlet.id} onSelect={() => onChange(outlet.id)}>
          <Store aria-hidden="true" className="h-4 w-4" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{outlet.name}</span>
            <span className="text-caption text-muted-foreground">
              {outlet.city}
            </span>
          </span>
          {outlet.id === activeOutlet.id ? (
            <Check
              aria-hidden="true"
              className="ml-auto h-4 w-4 text-primary-strong"
            />
          ) : null}
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}
