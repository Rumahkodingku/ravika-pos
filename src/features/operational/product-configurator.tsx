"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { QuantityControl } from "@/components/ui/quantity-control";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import type { AddOn, Product } from "@/types/domain";

export type ProductConfiguratorResult = {
  productId: string;
  variantId: string | null;
  addOnIds: string[];
  quantity: number;
  notes: string;
};

export function ProductConfigurator({
  addOns,
  onOpenChange,
  onSubmit,
  open,
  product,
  submitLabel = "Tambahkan",
}: {
  addOns: AddOn[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ProductConfiguratorResult) => void;
  open: boolean;
  product: Product | null;
  submitLabel?: string;
}) {
  const activeVariants = useMemo(
    () => product?.variants.filter((variant) => variant.isActive) ?? [],
    [product],
  );
  const [variantId, setVariantId] = useState("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !product) {
      return;
    }

    setVariantId(activeVariants[0]?.id ?? "");
    setSelectedAddOnIds([]);
    setQuantity(1);
    setNotes("");
    setError(null);
  }, [activeVariants, open, product]);

  if (!product) {
    return null;
  }

  const selectedVariant =
    activeVariants.find((variant) => variant.id === variantId) ?? null;
  const selectedAddOns = selectedAddOnIds
    .map((addOnId) => addOns.find((addOn) => addOn.id === addOnId))
    .filter((addOn): addOn is AddOn => Boolean(addOn));
  const addOnTotal = selectedAddOns.reduce(
    (total, addOn) => total + addOn.price,
    0,
  );
  const baseUnitPrice = product.variants.length
    ? (selectedVariant?.price ?? null)
    : product.basePrice;
  const unitPrice = baseUnitPrice === null ? null : baseUnitPrice + addOnTotal;
  const total = unitPrice === null ? null : unitPrice * quantity;

  const validate = () => {
    if (product.variants.length > 0 && activeVariants.length === 0) {
      return "Tidak ada varian yang tersedia.";
    }

    if (activeVariants.length > 0 && !variantId) {
      return "Pilih varian terlebih dahulu.";
    }

    if (baseUnitPrice === null) {
      return "Harga produk belum dikonfigurasi.";
    }

    for (const relation of product.addOns) {
      const count = selectedAddOnIds.filter(
        (addOnId) => addOnId === relation.addOnId,
      ).length;

      if (relation.isRequired && count === 0) {
        return "Add-on wajib belum dipilih.";
      }
      if (count < relation.minSelection) {
        return "Jumlah add-on kurang dari batas minimum.";
      }
      if (count > relation.maxSelection) {
        return "Jumlah add-on melebihi batas maksimum.";
      }
    }

    return null;
  };

  const submit = () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit({
      productId: product.id,
      variantId: variantId || null,
      addOnIds: selectedAddOnIds,
      quantity,
      notes,
    });
    onOpenChange(false);
  };

  return (
    <Drawer
      description="Pilih varian, add-on, dan catatan item."
      footer={
        <>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Batal
          </Button>
          <Button onClick={submit}>{submitLabel}</Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      title={product.name}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-subtle p-3">
          <div className="flex flex-col">
            <span className="text-label font-medium text-foreground">
              Harga satuan
            </span>
            <span className="text-caption text-muted-foreground">
              {product.isAvailable ? "Tersedia" : "Habis"}
            </span>
          </div>
          <span className="text-card-title tabular-nums text-foreground">
            {unitPrice === null
              ? "Harga belum dikonfigurasi"
              : formatCurrency(unitPrice)}
          </span>
        </div>

        {activeVariants.length > 0 ? (
          <Field htmlFor={`variant-${product.id}`} label="Varian" required>
            <Select
              id={`variant-${product.id}`}
              onChange={(event) => setVariantId(event.target.value)}
              value={variantId}
            >
              {activeVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} ({formatCurrency(variant.price)})
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        {product.addOns.length > 0 ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-label font-medium text-foreground">
              Add-on
            </legend>
            {product.addOns.map((relation) => {
              const addOn = addOns.find(
                (candidate) => candidate.id === relation.addOnId,
              );

              if (!addOn || !addOn.isActive) {
                return null;
              }

              return (
                <label
                  className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border px-3 text-body text-foreground"
                  htmlFor={`addon-${product.id}-${addOn.id}`}
                  key={addOn.id}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Checkbox
                      checked={selectedAddOnIds.includes(addOn.id)}
                      id={`addon-${product.id}-${addOn.id}`}
                      onChange={() =>
                        setSelectedAddOnIds((current) =>
                          current.includes(addOn.id)
                            ? current.filter((id) => id !== addOn.id)
                            : [...current, addOn.id],
                        )
                      }
                    />
                    <span className="truncate">{addOn.name}</span>
                    {relation.isRequired ? (
                      <Badge tone="warning">Wajib</Badge>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                    +{formatCurrency(addOn.price)}
                  </span>
                </label>
              );
            })}
          </fieldset>
        ) : null}

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-label font-medium text-foreground">
            Kuantitas
          </legend>
          <QuantityControl onChange={setQuantity} value={quantity} />
        </fieldset>

        <Field htmlFor={`notes-${product.id}`} label="Catatan item">
          <Textarea
            id={`notes-${product.id}`}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Contoh: less sugar"
            value={notes}
          />
        </Field>

        {error ? (
          <p
            className="text-caption font-medium text-danger-strong"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-body text-muted-foreground">Total</span>
          <span className="text-card-title tabular-nums text-foreground">
            {total === null
              ? "Harga belum dikonfigurasi"
              : formatCurrency(total)}
          </span>
        </div>
      </div>
    </Drawer>
  );
}
