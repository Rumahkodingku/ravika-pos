import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        size === "default" && "max-w-6xl lg:px-8",
        size === "wide" && "max-w-[1440px] lg:px-8",
        size === "narrow" && "max-w-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
}: {
  actions?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? (
          <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-page-title text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-body text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function Section({
  children,
  className,
  description,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
  title?: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title ? (
        <div className="flex flex-col gap-1">
          <h2 className="text-section-title text-foreground">{title}</h2>
          {description ? (
            <p className="text-body text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stack({
  children,
  className,
  gap = "md",
}: {
  children: React.ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        gap === "sm" && "gap-2",
        gap === "md" && "gap-4",
        gap === "lg" && "gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
