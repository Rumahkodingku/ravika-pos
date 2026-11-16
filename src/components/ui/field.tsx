import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: association is provided by the consumer via htmlFor
  <label
    className={cn("text-label font-medium text-foreground", className)}
    ref={ref}
    {...props}
  />
));

Label.displayName = "Label";

export function Field({
  children,
  className,
  description,
  error,
  htmlFor,
  label,
  required,
}: {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  label: ReactNode;
  required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger-strong">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function FieldDescription({ children }: { children: ReactNode }) {
  return <p className="text-caption text-muted-foreground">{children}</p>;
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <p className="text-caption font-medium text-danger-strong" role="alert">
      {children}
    </p>
  );
}
