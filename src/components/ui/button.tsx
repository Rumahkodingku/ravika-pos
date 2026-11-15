import { Loader2 } from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger/90 active:bg-danger/80",
  link: "bg-transparent px-0 text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-label",
  md: "h-11 px-4",
  lg: "h-12 px-6 text-body",
  icon: "h-11 w-11 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      isLoading = false,
      leftIcon,
      rightIcon,
      size = "md",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        aria-busy={isLoading || undefined}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        ref={ref}
        type={type}
        {...props}
      >
        {isLoading ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
