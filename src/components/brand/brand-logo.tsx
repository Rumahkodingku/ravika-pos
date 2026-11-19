import Image from "next/image";

type BrandLogoSize = "sm" | "md" | "lg";

const sizes: Record<BrandLogoSize, { height: number; width: number }> = {
  lg: { height: 35, width: 40 },
  md: { height: 28, width: 32 },
  sm: { height: 25, width: 28 },
};

export function BrandLogo({
  className,
  priority = false,
  size = "md",
}: {
  className?: string;
  priority?: boolean;
  size?: BrandLogoSize;
}) {
  const dimensions = sizes[size];

  return (
    <Image
      alt="Logomark RAVIKA"
      className={className}
      height={dimensions.height}
      priority={priority}
      src="/brand/logomark.webp"
      width={dimensions.width}
    />
  );
}
