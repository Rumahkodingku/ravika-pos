"use client";

import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useId,
  useState,
} from "react";
import { cn } from "@/lib/cn";

export function Tooltip({
  children,
  content,
}: {
  children: ReactElement<{
    "aria-describedby"?: string;
    onBlur?: React.FocusEventHandler;
    onFocus?: React.FocusEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  }>;
  content: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      {cloneElement(children, {
        "aria-describedby": open ? id : undefined,
        onBlur: (event) => {
          children.props.onBlur?.(event);
          setOpen(false);
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          setOpen(true);
        },
        onMouseEnter: (event) => {
          children.props.onMouseEnter?.(event);
          setOpen(true);
        },
        onMouseLeave: (event) => {
          children.props.onMouseLeave?.(event);
          setOpen(false);
        },
      })}
      {open ? (
        <span
          className={cn(
            "absolute bottom-full left-1/2 z-[var(--z-dropdown)] mb-2 w-max max-w-64 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-caption text-background",
          )}
          id={id}
          role="tooltip"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
