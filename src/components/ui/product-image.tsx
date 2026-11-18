"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductImage({
  className,
  iconClassName,
  name,
  src,
}: {
  className?: string;
  iconClassName?: string;
  name: string;
  src: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Package
        aria-hidden="true"
        className={cn("h-10 w-10 text-muted-foreground", iconClassName)}
      />
    );
  }

  return (
    // Product images are served by the app itself; next/image would add remote config for no benefit here.
    // biome-ignore lint/performance/noImgElement: local dynamic image route
    <img
      alt={name}
      className={cn("h-full w-full object-cover", className)}
      decoding="async"
      loading="lazy"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}
