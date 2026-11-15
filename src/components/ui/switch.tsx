"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function Switch({
  checked,
  className,
  description,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        aria-checked={checked}
        aria-describedby={descriptionId}
        aria-labelledby={`${id}-label`}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
          checked ? "bg-primary" : "bg-muted",
        )}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
      <span className="flex flex-col gap-0.5">
        <span
          className="text-body font-medium text-foreground"
          id={`${id}-label`}
        >
          {label}
        </span>
        {description ? (
          <span
            className="text-caption text-muted-foreground"
            id={descriptionId}
          >
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}
