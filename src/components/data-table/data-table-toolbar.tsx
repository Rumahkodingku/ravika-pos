"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { SearchInput } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type FilterMode = "inline" | "modal";

export function DataTableToolbar({
  activeFilterCount = 0,
  filterDescription = "Pilih filter dan rentang tanggal.",
  filters,
  filterMode = "inline",
  filterTitle = "Filter pesanan",
  hasActiveFilters = false,
  onFilterApply,
  onFilterOpen,
  onReset,
  onSearchChange,
  resultCount,
  search,
  searchPlaceholder = "Cari data",
  showResultCount = true,
}: {
  activeFilterCount?: number;
  filterDescription?: string;
  filters?: React.ReactNode;
  filterMode?: FilterMode;
  filterTitle?: string;
  hasActiveFilters?: boolean;
  onFilterApply?: () => void;
  onFilterOpen?: () => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  resultCount: number;
  search: string;
  searchPlaceholder?: string;
  showResultCount?: boolean;
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

  const openFilter = () => {
    onFilterOpen?.();
    setFilterOpen(true);
  };

  const applyFilter = () => {
    onFilterApply?.();
    setFilterOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1 sm:max-w-sm">
          <SearchInput
            aria-label={searchPlaceholder}
            onChange={(event) => setValue(event.target.value)}
            placeholder={searchPlaceholder}
            value={value}
          />
        </div>

        {filters && filterMode === "inline" ? (
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {filters}
          </div>
        ) : null}

        {filters ? (
          <Button
            className={cn(
              filterMode === "inline" ? "md:hidden" : "w-full sm:w-auto",
            )}
            onClick={openFilter}
            variant="outline"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 ? (
              <Badge tone="primary">{activeFilterCount}</Badge>
            ) : null}
          </Button>
        ) : null}

        {filterMode === "inline" && hasActiveFilters ? (
          <Button onClick={onReset} variant="ghost">
            <X aria-hidden="true" className="h-4 w-4" />
            Reset filter
          </Button>
        ) : null}

        {showResultCount ? (
          <p className="ml-auto text-caption text-muted-foreground">
            {resultCount} hasil
          </p>
        ) : null}
      </div>

      {filters && filterMode === "inline" ? (
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

      {filters && filterMode === "modal" ? (
        <Dialog
          description={filterDescription}
          footer={
            <>
              <Button onClick={onReset} variant="ghost">
                Reset
              </Button>
              <Button onClick={applyFilter}>Terapkan filter</Button>
            </>
          }
          onOpenChange={setFilterOpen}
          open={filterOpen}
          title={filterTitle}
        >
          <div className="flex flex-col gap-4">{filters}</div>
        </Dialog>
      ) : null}
    </div>
  );
}
