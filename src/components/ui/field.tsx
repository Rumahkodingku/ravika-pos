import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
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
  const descriptionId =
    description && htmlFor ? `${htmlFor}-description` : undefined;
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control =
    isValidElement(children) && (descriptionId || errorId)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        })
      : children;

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
      {control}
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export function FieldDescription({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p className="text-caption text-muted-foreground" id={id}>
      {children}
    </p>
  );
}

export function FieldError({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p
      className="text-caption font-medium text-danger-strong"
      id={id}
      role="alert"
    >
      {children}
    </p>
  );
}
