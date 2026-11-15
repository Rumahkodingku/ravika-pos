import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  action,
  className,
  description,
  icon: Icon = Inbox,
  title,
}: {
  action?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  title: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center",
        className,
      )}
    >
      <Icon aria-hidden={true} className="h-8 w-8 text-muted-foreground" />
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-card-title text-foreground">{title}</h3>
        {description ? (
          <p className="text-body text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
