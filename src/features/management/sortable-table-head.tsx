"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function SortableTableHead({
  active,
  direction,
  label,
  onSort,
  sortKey,
}: {
  active: boolean;
  direction: "asc" | "desc";
  label: string;
  onSort: (key: string) => void;
  sortKey: string;
}) {
  return (
    <th
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
      className="h-10 px-3 text-left align-middle text-label font-medium text-muted-foreground"
    >
      <button
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-sm text-left hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
          active && "text-foreground",
        )}
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
        )}
      </button>
    </th>
  );
}
