import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ServiceFlowStep } from "@/types/ui";

const stateStyles = {
  complete: {
    dot: "border-success bg-success text-primary-action-foreground",
    label: "text-foreground",
    line: "bg-success/40",
  },
  current: {
    dot: "border-primary bg-primary text-primary-foreground ring-4 ring-primary/15",
    label: "text-foreground",
    line: "bg-border",
  },
  upcoming: {
    dot: "border-border bg-surface text-muted-foreground",
    label: "text-muted-foreground",
    line: "bg-border",
  },
  cancelled: {
    dot: "border-danger bg-danger text-primary-action-foreground",
    label: "text-danger-strong",
    line: "bg-danger/30",
  },
} satisfies Record<
  ServiceFlowStep["state"],
  { dot: string; label: string; line: string }
>;

function StepDot({ step }: { step: ServiceFlowStep }) {
  const styles = stateStyles[step.state];

  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
        styles.dot,
      )}
    >
      {step.state === "complete" ? (
        <Check aria-hidden="true" className="h-3 w-3" />
      ) : step.state === "cancelled" ? (
        "×"
      ) : null}
    </span>
  );
}

export function ServiceFlow({
  className,
  orientation = "horizontal",
  steps,
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
  steps: ServiceFlowStep[];
}) {
  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {steps.map((step, index) => {
          const styles = stateStyles[step.state];

          return (
            <li className="flex gap-3" key={step.id}>
              <div className="flex flex-col items-center">
                <StepDot step={step} />
                {index < steps.length - 1 ? (
                  <span
                    className={cn("my-1 w-px flex-1", styles.line)}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 pb-4">
                <p className={cn("text-label font-medium", styles.label)}>
                  {step.label}
                </p>
                {step.count !== undefined ? (
                  <p className="text-caption text-muted-foreground">
                    {step.count} pesanan
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        "flex w-full items-start gap-2 overflow-x-auto pb-1",
        className,
      )}
      aria-label="Alur status pesanan"
    >
      {steps.map((step, index) => {
        const styles = stateStyles[step.state];

        return (
          <li
            aria-current={step.state === "current" ? "step" : undefined}
            className="flex min-w-0 flex-1 flex-col gap-1.5"
            key={step.id}
          >
            <div className="flex items-center gap-2">
              <StepDot step={step} />
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("h-px flex-1", styles.line)}
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p
                className={cn(
                  "truncate text-caption font-medium",
                  styles.label,
                )}
              >
                {step.label}
              </p>
              {step.count !== undefined ? (
                <p className="text-caption tabular-nums text-muted-foreground">
                  {step.count}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
