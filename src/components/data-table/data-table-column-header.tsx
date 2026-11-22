"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      className="-ml-3 h-9 gap-1.5 px-2 font-medium text-muted-foreground hover:text-foreground"
      onClick={column.getToggleSortingHandler()}
      size="sm"
      variant="ghost"
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 opacity-60" />
      )}
    </Button>
  );
}
