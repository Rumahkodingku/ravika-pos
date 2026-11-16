"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function getPageItems(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];

  if (page > 3) {
    items.push("ellipsis");
  }

  for (
    let current = Math.max(2, page - 1);
    current <= Math.min(pageCount - 1, page + 1);
    current += 1
  ) {
    items.push(current);
  }

  if (page < pageCount - 2) {
    items.push("ellipsis");
  }

  items.push(pageCount);

  return items;
}

export function Pagination({
  className,
  onPageChange,
  page,
  pageCount,
}: {
  className?: string;
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 0) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      <Button
        aria-label="Halaman sebelumnya"
        className="h-11"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </Button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {getPageItems(page, pageCount).map((item, index) =>
          item === "ellipsis" ? (
            <span
              className="px-2 text-caption text-muted-foreground"
              key={index === 1 ? "ellipsis-start" : "ellipsis-end"}
            >
              …
            </span>
          ) : (
            <Button
              aria-current={item === page ? "page" : undefined}
              aria-label={`Halaman ${item}`}
              className="h-11 min-w-11 px-2"
              key={item}
              onClick={() => onPageChange(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ),
        )}
      </div>
      <Button
        aria-label="Halaman berikutnya"
        className="h-11"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        variant="outline"
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </nav>
  );
}
