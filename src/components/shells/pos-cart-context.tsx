"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePosCatalogQuery } from "@/features/operational/api";
import { resolveProductUnitPrice } from "@/lib/catalog-pricing";
import type { AddOn, Product, ProductVariant } from "@/types/domain";

const STORAGE_KEY = "ravika-pos-cart";

export type PosOrderType = "DINE_IN" | "TAKEAWAY";

export type PosCartDraft = {
  key: string;
  productId: string;
  variantId: string | null;
  addOnIds: string[];
  quantity: number;
  notes: string;
};

export type PosCartLine = PosCartDraft & {
  product: Product;
  variant: ProductVariant | null;
  addOns: AddOn[];
  unitPrice: number;
  lineTotal: number;
};

type StoredCart = {
  orderType: PosOrderType;
  tableId: string | null;
  orderNotes: string;
  items: PosCartDraft[];
};

type PosCartContextValue = {
  addLine: (input: Omit<PosCartDraft, "key">) => void;
  clearCart: () => void;
  itemCount: number;
  lines: PosCartLine[];
  orderNotes: string;
  orderType: PosOrderType;
  removeLine: (key: string) => void;
  setOrderNotes: (notes: string) => void;
  setOrderType: (orderType: PosOrderType) => void;
  setQuantity: (key: string, quantity: number) => void;
  setTableId: (tableId: string | null) => void;
  subtotal: number;
  tableId: string | null;
};

const PosCartContext = createContext<PosCartContextValue | null>(null);

function lineKey(input: Omit<PosCartDraft, "key">) {
  return [
    input.productId,
    input.variantId ?? "",
    [...input.addOnIds].sort().join(","),
    input.notes.trim(),
  ].join(":");
}

function resolveLine(
  draft: PosCartDraft,
  products: Product[],
  addOns: AddOn[],
): PosCartLine | null {
  const product = products.find(
    (candidate) =>
      candidate.id === draft.productId &&
      candidate.isActive &&
      candidate.isAvailable,
  );

  if (!product) {
    return null;
  }

  const variant = draft.variantId
    ? (product.variants.find(
        (candidate) => candidate.id === draft.variantId && candidate.isActive,
      ) ?? null)
    : null;

  if (product.variants.length > 0 && !variant) {
    return null;
  }

  if (product.variants.length === 0 && draft.variantId) {
    return null;
  }

  const selectedAddOns = draft.addOnIds.map((addOnId) =>
    addOns.find((candidate) => candidate.id === addOnId && candidate.isActive),
  );

  if (selectedAddOns.some((addOn) => !addOn)) {
    return null;
  }

  const baseUnitPrice = resolveProductUnitPrice(product, variant);

  if (baseUnitPrice === null) {
    return null;
  }

  const addOnList = selectedAddOns as AddOn[];
  const unitPrice =
    baseUnitPrice + addOnList.reduce((total, addOn) => total + addOn.price, 0);

  return {
    ...draft,
    product,
    variant,
    addOns: addOnList,
    unitPrice,
    lineTotal: unitPrice * draft.quantity,
  };
}

export function PosCartProvider({ children }: { children: ReactNode }) {
  const { products, addOns } = usePosCatalogQuery();
  const [items, setItems] = useState<PosCartDraft[]>([]);
  const [orderType, setOrderType] = useState<PosOrderType>("DINE_IN");
  const [tableId, setTableId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredCart;

        setItems(parsed.items);
        setOrderType(parsed.orderType);
        setTableId(parsed.tableId);
        setOrderNotes(parsed.orderNotes);
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const stored: StoredCart = {
      orderType,
      tableId,
      orderNotes,
      items,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [hydrated, items, orderNotes, orderType, tableId]);

  const lines = useMemo(
    () =>
      items
        .map((item) => resolveLine(item, products, addOns))
        .filter((line): line is PosCartLine => line !== null),
    [addOns, items, products],
  );
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  const value = useMemo<PosCartContextValue>(
    () => ({
      addLine: (input) => {
        const key = lineKey(input);

        setItems((current) => {
          const existing = current.find((item) => item.key === key);

          if (existing) {
            return current.map((item) =>
              item.key === key
                ? { ...item, quantity: item.quantity + input.quantity }
                : item,
            );
          }

          return [...current, { ...input, key }];
        });
      },
      clearCart: () => {
        setItems([]);
        setTableId(null);
        setOrderNotes("");
      },
      itemCount,
      lines,
      orderNotes,
      orderType,
      removeLine: (key) => {
        setItems((current) => current.filter((item) => item.key !== key));
      },
      setOrderNotes,
      setOrderType,
      setQuantity: (key, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => item.key !== key)
            : current.map((item) =>
                item.key === key ? { ...item, quantity } : item,
              ),
        );
      },
      setTableId,
      subtotal,
      tableId,
    }),
    [itemCount, lines, orderNotes, orderType, subtotal, tableId],
  );

  return (
    <PosCartContext.Provider value={value}>{children}</PosCartContext.Provider>
  );
}

export function usePosCart() {
  const context = useContext(PosCartContext);

  if (!context) {
    throw new Error("usePosCart must be used within PosCartProvider");
  }

  return context;
}
