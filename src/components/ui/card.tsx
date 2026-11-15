import { cn } from "@/lib/cn";

export type CardVariant =
  | "default"
  | "interactive"
  | "stat"
  | "product"
  | "order"
  | "surface-subtle";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface",
  interactive:
    "bg-surface transition-colors hover:border-primary/40 hover:bg-surface-subtle motion-reduce:transition-none",
  stat: "bg-surface-subtle",
  product: "overflow-hidden bg-surface",
  order: "bg-surface",
  "surface-subtle": "bg-surface-subtle",
};

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border text-foreground shadow-sm",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  action,
  className,
  description,
  title,
}: {
  action?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-card-title text-foreground">{title}</h3>
        {description ? (
          <p className="text-caption text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4 sm:p-5", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
