import {
  Coffee,
  Croissant,
  CupSoda,
  IceCreamBowl,
  type LucideIcon,
  Sandwich,
  UtensilsCrossed,
} from "lucide-react";

export type MockProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  icon: LucideIcon;
};

export type MockCartItem = {
  productId: string;
  quantity: number;
  note?: string;
};

export const menuCategories = [
  "Semua",
  "Kopi",
  "Non-kopi",
  "Makanan",
  "Snack",
] as const;

export const mockProducts: MockProduct[] = [
  {
    id: "product-espresso",
    name: "Espresso",
    price: 22000,
    category: "Kopi",
    available: true,
    icon: Coffee,
  },
  {
    id: "product-kopi-susu",
    name: "Kopi Susu",
    price: 28000,
    category: "Kopi",
    available: true,
    icon: Coffee,
  },
  {
    id: "product-matcha",
    name: "Matcha Latte",
    price: 32000,
    category: "Non-kopi",
    available: true,
    icon: CupSoda,
  },
  {
    id: "product-croissant",
    name: "Croissant Butter",
    price: 26000,
    category: "Snack",
    available: true,
    icon: Croissant,
  },
  {
    id: "product-sandwich",
    name: "Chicken Sandwich",
    price: 38000,
    category: "Makanan",
    available: true,
    icon: Sandwich,
  },
  {
    id: "product-es-teh",
    name: "Es Teh Lemon",
    price: 18000,
    category: "Non-kopi",
    available: false,
    icon: IceCreamBowl,
  },
];

export const mockCartItems: MockCartItem[] = [
  {
    productId: "product-kopi-susu",
    quantity: 2,
    note: "Less sugar",
  },
  {
    productId: "product-croissant",
    quantity: 1,
  },
];

export const fallbackProductIcon = UtensilsCrossed;
