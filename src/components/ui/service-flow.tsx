import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ServiceFlowStep } from "@/types/ui";

const dotStateClasses: Record<ServiceFlowStep["state"], string> = {
  complete: "border-[var(--step-color)] bg-[var(--step-color)] text-background",
  current:
    "border-[var(--step-color)] bg-[var(--step-color)] text-background ring-2 ring-[var(--step-color)] ring-offset-2 ring-offset-background",
  active: "border-[var(--step-color)] bg-[var(--step-color)] text-background",
  upcoming:
    "border-dashed border-[var(--step-color)] bg-transparent text-[var(--step-strong)]",
  cancelled:
    "border-[var(--step-color)] bg-[var(--step-color)] text-background",
};

const labelStateClasses: Record<ServiceFlowStep["state"], string> = {
  complete: "text-[var(--step-strong)]",
  current: "text-[var(--step-strong)]",
  active: "text-[var(--step-strong)]",
  upcoming: "text-[var(--step-strong)] opacity-70",
  cancelled: "text-[var(--step-strong)]",
};

const lineStateClasses: Record<ServiceFlowStep["state"], string> = {
  complete: "bg-[var(--step-color)]",
  current: "bg-[var(--step-color)]",
  active: "bg-border",
  upcoming: "bg-border",
  cancelled: "bg-danger/30",
};

function StepDot({ step }: { step: ServiceFlowStep }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
        dotStateClasses[step.state],
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
  layout = "row",
  orientation = "horizontal",
  steps,
}: {
  className?: string;
  layout?: "row" | "grid";
  orientation?: "horizontal" | "vertical";
  steps: ServiceFlowStep[];
}) {
  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {steps.map((step, index) => (
          <li
            className="flex gap-3"
            data-step-tone={step.tone ?? "neutral"}
            key={step.id}
          >
            <div className="flex flex-col items-center">
              <StepDot step={step} />
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "my-1 w-px flex-1",
                    lineStateClasses[step.state],
                  )}
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-0.5 pb-4">
              <p
                className={cn(
                  "text-label font-medium",
                  labelStateClasses[step.state],
                )}
              >
                {step.label}
              </p>
              {step.count !== undefined ? (
                <p className="text-caption text-muted-foreground">
                  {step.count} pesanan
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      aria-label="Alur status pesanan"
      className={cn(
        layout === "grid"
          ? "grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:w-full sm:items-start sm:gap-2 sm:overflow-x-auto sm:pb-1"
          : "flex w-full items-start gap-2 overflow-x-auto pb-1",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          aria-current={step.state === "current" ? "step" : undefined}
          className={cn(
            "flex flex-col gap-1.5",
            layout === "grid"
              ? "min-w-0 sm:min-w-[72px] sm:flex-1"
              : "min-w-[72px] flex-1",
          )}
          data-step-tone={step.tone ?? "neutral"}
          key={step.id}
          title={step.label}
        >
          <div className="flex items-center gap-2">
            <StepDot step={step} />
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1",
                  layout === "grid" && "hidden sm:block",
                  lineStateClasses[step.state],
                )}
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p
              className={cn(
                "truncate text-caption font-medium",
                labelStateClasses[step.state],
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
      ))}
    </ol>
  );
}
