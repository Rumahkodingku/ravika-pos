"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import { cn } from "@/lib/cn";

type TabsContextValue = {
  baseId: string;
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  children,
  className,
  defaultValue,
  onValueChange,
  value: controlledValue,
}: {
  children: ReactNode;
  className?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  value?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const baseId = useId();

  const setValue = (nextValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ baseId, value, setValue }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ),
    );
    const activeIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    let nextIndex = 0;

    if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = activeIndex <= 0 ? tabs.length - 1 : activeIndex - 1;
    } else if (event.key === "ArrowRight") {
      nextIndex = activeIndex >= tabs.length - 1 ? 0 : activeIndex + 1;
    }

    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div
      aria-label="Tab"
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-surface-subtle p-1",
        className,
      )}
      onKeyDown={handleKeyDown}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  className,
  disabled,
  value,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  value: string;
}) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const active = context.value === value;

  return (
    <button
      aria-controls={`${context.baseId}-panel-${value}`}
      aria-selected={active}
      className={cn(
        "rounded-md px-3 py-1.5 text-label font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none",
        active && "bg-surface text-foreground",
        className,
      )}
      disabled={disabled}
      id={`${context.baseId}-tab-${value}`}
      onClick={() => context.setValue(value)}
      role="tab"
      tabIndex={active ? 0 : -1}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  className,
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const active = context.value === value;

  return (
    <div
      aria-labelledby={`${context.baseId}-tab-${value}`}
      className={cn("focus-visible:outline-none", className)}
      hidden={!active}
      id={`${context.baseId}-panel-${value}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
