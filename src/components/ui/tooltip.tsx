"use client";

import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPosition({
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    const handleUpdate = () => updatePosition();

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [open, updatePosition]);

  return (
    <span className="relative inline-flex" ref={triggerRef}>
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
      {open && position && typeof document !== "undefined"
        ? createPortal(
            <span
              className={cn(
                "fixed z-[9999] w-max max-w-64 rounded-md bg-foreground px-2 py-1 text-caption text-background",
              )}
              id={id}
              role="tooltip"
              style={{
                left: position.left,
                top: position.top - 8,
                transform: "translate(-50%, -100%)",
              }}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
