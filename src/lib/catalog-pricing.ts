export type PricingVariant = {
  isActive: boolean;
  price: number;
};

export type PricingProduct = {
  basePrice: number | null;
  variants: PricingVariant[];
};

export type SellableProduct = PricingProduct & {
  isActive: boolean;
  isAvailable: boolean;
};

export type ProductPriceDisplay =
  | { amount: number; kind: "fixed" }
  | { amount: number; kind: "from" }
  | { kind: "unavailable" };

export function hasVariants(product: Pick<PricingProduct, "variants">) {
  return product.variants.length > 0;
}

export function hasActiveVariants(product: Pick<PricingProduct, "variants">) {
  return product.variants.some((variant) => variant.isActive);
}

export function minimumActiveVariantPrice(
  product: Pick<PricingProduct, "variants">,
) {
  const prices = product.variants
    .filter((variant) => variant.isActive)
    .map((variant) => variant.price);

  return prices.length > 0 ? Math.min(...prices) : null;
}

export function resolveProductUnitPrice(
  product: PricingProduct,
  variant: PricingVariant | null,
) {
  if (hasVariants(product)) {
    return variant?.isActive ? variant.price : null;
  }

  return product.basePrice;
}

export function productPriceDisplay(
  product: PricingProduct,
): ProductPriceDisplay {
  const activeVariants = product.variants.filter((variant) => variant.isActive);

  if (activeVariants.length > 0) {
    return {
      amount: Math.min(...activeVariants.map((variant) => variant.price)),
      kind: activeVariants.length === 1 ? "fixed" : "from",
    };
  }

  if (!hasVariants(product) && product.basePrice !== null) {
    return { amount: product.basePrice, kind: "fixed" };
  }

  return { kind: "unavailable" };
}

export function isProductSellable(product: SellableProduct) {
  if (!product.isActive || !product.isAvailable) {
    return false;
  }

  if (hasVariants(product)) {
    return hasActiveVariants(product);
  }

  return product.basePrice !== null;
}
