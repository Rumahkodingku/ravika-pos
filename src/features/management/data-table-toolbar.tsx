"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { SearchInput } from "@/components/ui/input";

export function DataTableToolbar({
  filters,
  hasActiveFilters = false,
  onReset,
  onSearchChange,
  resultCount,
  search,
  searchPlaceholder = "Cari data",
}: {
  filters?: React.ReactNode;
  hasActiveFilters?: boolean;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  resultCount: number;
  search: string;
  searchPlaceholder?: string;
}) {
  const [value, setValue] = useState(search);
  const [filterOpen, setFilterOpen] = useState(false);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    setValue(search);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onSearchChangeRef.current(value);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <SearchInput
            aria-label={searchPlaceholder}
            onChange={(event) => setValue(event.target.value)}
            placeholder={searchPlaceholder}
            value={value}
          />
        </div>
        {filters ? (
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {filters}
          </div>
        ) : null}
        {filters ? (
          <Button
            className="md:hidden"
            onClick={() => setFilterOpen(true)}
            variant="outline"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Filter
          </Button>
        ) : null}
        {hasActiveFilters ? (
          <Button onClick={onReset} variant="ghost">
            <X aria-hidden="true" className="h-4 w-4" />
            Reset filter
          </Button>
        ) : null}
        <p className="ml-auto text-caption text-muted-foreground">
          {resultCount} hasil
        </p>
      </div>

      {filters ? (
        <Drawer
          footer={
            <Button className="w-full" onClick={() => setFilterOpen(false)}>
              Terapkan filter
            </Button>
          }
          onOpenChange={setFilterOpen}
          open={filterOpen}
          side="bottom"
          title="Filter"
        >
          <div className="flex flex-col gap-3">{filters}</div>
        </Drawer>
      ) : null}
    </div>
  );
}
