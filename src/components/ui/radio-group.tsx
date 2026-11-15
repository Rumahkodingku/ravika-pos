import { cn } from "@/lib/cn";

export type RadioOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export function RadioGroup({
  className,
  label,
  name,
  onValueChange,
  options,
  value,
}: {
  className?: string;
  label: string;
  name: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  value: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="mb-1 text-label font-medium text-foreground">
        {label}
      </legend>
      {options.map((option) => (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:bg-muted/60",
            option.disabled && "cursor-not-allowed opacity-50",
          )}
          key={option.value}
        >
          <input
            checked={value === option.value}
            className="mt-0.5 h-5 w-5 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            disabled={option.disabled}
            name={name}
            onChange={() => onValueChange(option.value)}
            type="radio"
            value={option.value}
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-body font-medium text-foreground">
              {option.label}
            </span>
            {option.description ? (
              <span className="text-caption text-muted-foreground">
                {option.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
