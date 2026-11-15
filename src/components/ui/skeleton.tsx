import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  shape = "rect",
}: {
  className?: string;
  shape?: "circle" | "rect" | "text";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-muted motion-reduce:animate-none",
        shape === "circle" && "rounded-full",
        shape === "rect" && "rounded-md",
        shape === "text" && "h-4 rounded-sm",
        className,
      )}
    />
  );
}
