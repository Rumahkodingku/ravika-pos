import { Search } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const inputBaseClasses =
  "flex h-11 w-full rounded-md border border-input bg-surface px-3 text-body text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger motion-reduce:transition-none";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      className={cn(inputBaseClasses, className)}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        className={cn(inputBaseClasses, "pl-9", className)}
        ref={ref}
        type="search"
        {...props}
      />
    </div>
  ),
);

SearchInput.displayName = "SearchInput";
