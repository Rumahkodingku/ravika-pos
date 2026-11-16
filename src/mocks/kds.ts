import type { PreparationStatus } from "@/types/ui";

export type MockKdsItem = {
  name: string;
  quantity: number;
  note?: string;
};

export type MockKdsTicket = {
  id: string;
  orderNumber: string;
  status: PreparationStatus;
  orderType: "Dine-in" | "Takeaway";
  table?: string;
  elapsed: string;
  items: MockKdsItem[];
  note?: string;
};

export const mockKdsTickets: MockKdsTicket[] = [
  {
    id: "kds-0248",
    orderNumber: "KMG-0248",
    status: "NEW",
    orderType: "Dine-in",
    table: "Meja 04",
    elapsed: "2 mnt",
    items: [
      { name: "Kopi Susu", quantity: 2, note: "Less sugar" },
      { name: "Croissant Butter", quantity: 1 },
    ],
    note: "Sajikan bersama.",
  },
  {
    id: "kds-0247",
    orderNumber: "KMG-0247",
    status: "PREPARING",
    orderType: "Takeaway",
    elapsed: "5 mnt",
    items: [
      { name: "Matcha Latte", quantity: 1, note: "Oat milk" },
      { name: "Chicken Sandwich", quantity: 1 },
    ],
  },
  {
    id: "kds-0246",
    orderNumber: "KMG-0246",
    status: "READY",
    orderType: "Dine-in",
    table: "Meja 02",
    elapsed: "8 mnt",
    items: [
      { name: "Espresso", quantity: 2 },
      { name: "Es Teh Lemon", quantity: 1 },
    ],
  },
  {
    id: "kds-0245",
    orderNumber: "SNP-0119",
    status: "ACCEPTED",
    orderType: "Dine-in",
    table: "Meja 07",
    elapsed: "3 mnt",
    items: [
      { name: "Kopi Susu", quantity: 1 },
      { name: "Chicken Sandwich", quantity: 1 },
    ],
  },
];

export const kdsColumns: Array<{
  status: PreparationStatus;
  label: string;
  description: string;
}> = [
  { status: "NEW", label: "Baru", description: "Perlu diterima" },
  { status: "ACCEPTED", label: "Diterima", description: "Siap diproses" },
  { status: "PREPARING", label: "Disiapkan", description: "Sedang dibuat" },
  { status: "READY", label: "Siap", description: "Menunggu diambil" },
  { status: "COMPLETED", label: "Selesai", description: "Sudah diserahkan" },
];
