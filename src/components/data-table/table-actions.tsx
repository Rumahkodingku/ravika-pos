"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

export type TableAction = {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "danger";
};

export function TableActions({
  actions,
  className,
}: {
  actions: TableAction[];
  className?: string;
}) {
  return (
    <div className={cn("flex justify-end gap-1", className)}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Tooltip content={action.label} key={action.label}>
            <Button
              aria-label={action.label}
              disabled={action.disabled}
              onClick={action.onClick}
              size="sm"
              variant={action.variant ?? "ghost"}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}
