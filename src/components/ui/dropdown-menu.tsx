"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DropdownContextValue = {
  close: () => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownMenu({
  align = "end",
  children,
  className,
  menuClassName,
  size = "md",
  trigger,
  variant = "ghost",
}: {
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
  menuClassName?: string;
  size?: ButtonProps["size"];
  trigger: ReactNode;
  variant?: ButtonProps["variant"];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const firstItem = menuRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]:not([disabled])',
    );
    firstItem?.focus();
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    ).filter((item) => item.offsetParent !== null);

    if (items.length === 0) {
      return;
    }

    const activeIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = 0;

    if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowUp") {
      nextIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
    }

    items[nextIndex]?.focus();
  };

  return (
    <div className={cn("relative inline-flex", className)} ref={rootRef}>
      <Button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        size={size}
        variant={variant}
      >
        {trigger}
      </Button>
      {open ? (
        <div
          className={cn(
            "absolute top-full z-[var(--z-dropdown)] mt-2 min-w-56 rounded-lg border border-border bg-surface-elevated p-1 shadow-overlay",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          ref={menuRef}
          role="menu"
        >
          <DropdownContext.Provider value={{ close: () => setOpen(false) }}>
            {children}
          </DropdownContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  disabled,
  onSelect,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  const context = useContext(DropdownContext);

  return (
    <button
      className={cn(
        "flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-body text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
        className,
      )}
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        context?.close();
      }}
      role="menuitem"
      type="button"
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-2 text-caption font-medium text-muted-foreground">
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <hr className="my-1 h-px border-0 bg-border" />;
}
