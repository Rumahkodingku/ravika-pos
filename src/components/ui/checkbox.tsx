import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, type = "checkbox", ...props }, ref) => (
    <input
      className={cn(
        "h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-input bg-surface text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Checkbox.displayName = "Checkbox";
