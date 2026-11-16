"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  type MockCartItem,
  type MockProduct,
  mockCartItems,
  mockProducts,
} from "@/mocks/catalog";

type PosCartLine = MockCartItem & {
  product: MockProduct;
};

export type PosOrderType = "DINE_IN" | "TAKEAWAY";

type PosCartContextValue = {
  addProduct: (product: MockProduct) => void;
  itemCount: number;
  lines: PosCartLine[];
  orderType: PosOrderType;
  setOrderType: (orderType: PosOrderType) => void;
  removeProduct: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  subtotal: number;
};

const PosCartContext = createContext<PosCartContextValue | null>(null);

function resolveLines(items: MockCartItem[]): PosCartLine[] {
  return items.flatMap((item) => {
    const product = mockProducts.find(
      (candidate) => candidate.id === item.productId,
    );

    return product ? [{ ...item, product }] : [];
  });
}

export function PosCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MockCartItem[]>(mockCartItems);
  const [orderType, setOrderType] = useState<PosOrderType>("DINE_IN");

  const value = useMemo<PosCartContextValue>(() => {
    const lines = resolveLines(items);
    const subtotal = lines.reduce(
      (total, line) => total + line.product.price * line.quantity,
      0,
    );
    const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

    return {
      addProduct: (product) => {
        setItems((current) => {
          const existing = current.find(
            (item) => item.productId === product.id,
          );

          if (existing) {
            return current.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }

          return [...current, { productId: product.id, quantity: 1 }];
        });
      },
      itemCount,
      lines,
      orderType,
      setOrderType,
      removeProduct: (productId) => {
        setItems((current) =>
          current.filter((item) => item.productId !== productId),
        );
      },
      setQuantity: (productId, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        );
      },
      subtotal,
    };
  }, [items, orderType]);

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
