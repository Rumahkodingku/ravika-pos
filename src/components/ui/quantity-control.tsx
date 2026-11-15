"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function QuantityControl({
  className,
  label = "Kuantitas",
  max = 99,
  min = 1,
  onChange,
  value,
}: {
  className?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Button
        aria-label={`Kurangi ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        size="icon"
        variant="outline"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </Button>
      <span
        aria-live="polite"
        className="min-w-10 text-center text-body font-medium tabular-nums text-foreground"
      >
        {value}
      </span>
      <Button
        aria-label={`Tambah ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        size="icon"
        variant="outline"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </Button>
    </div>
  );
}
