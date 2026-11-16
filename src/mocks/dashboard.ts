import type { PaymentStatus, PreparationStatus } from "@/types/ui";

export const dashboardStats = [
  {
    label: "Penjualan hari ini",
    value: 4850000,
    format: "currency" as const,
    change: "+12,4%",
    hint: "dibanding kemarin",
  },
  {
    label: "Transaksi",
    value: 128,
    format: "number" as const,
    change: "+8,1%",
    hint: "dibanding kemarin",
  },
  {
    label: "Pesanan aktif",
    value: 9,
    format: "number" as const,
    change: "3 siap",
    hint: "menunggu diambil",
  },
  {
    label: "Rata-rata transaksi",
    value: 37890,
    format: "currency" as const,
    change: "+4,2%",
    hint: "dibanding kemarin",
  },
];

export const todaySales = {
  value: 4850000,
  change: "+12,4%",
  comparison: "dibanding kemarin",
  transactions: 128,
  average: 37890,
  itemsSold: 342,
  sparkline: [
    { label: "08", value: 280000 },
    { label: "09", value: 460000 },
    { label: "10", value: 610000 },
    { label: "11", value: 540000 },
    { label: "12", value: 780000 },
    { label: "13", value: 920000 },
    { label: "14", value: 760000 },
    { label: "15", value: 500000 },
  ],
};

export const queueSteps = [
  { id: "new", label: "Baru", count: 12, state: "current" as const },
  { id: "accepted", label: "Diterima", count: 8, state: "upcoming" as const },
  { id: "preparing", label: "Disiapkan", count: 6, state: "upcoming" as const },
  { id: "ready", label: "Siap", count: 3, state: "upcoming" as const },
];

export const topProducts = [
  { name: "Kopi Susu", quantity: 86, revenue: 2408000 },
  { name: "Croissant Butter", quantity: 64, revenue: 1664000 },
  { name: "Matcha Latte", quantity: 42, revenue: 1344000 },
  { name: "Chicken Sandwich", quantity: 31, revenue: 1178000 },
];

export const salesTrend = [
  { label: "Sen", value: 3200000 },
  { label: "Sel", value: 4100000 },
  { label: "Rab", value: 3650000 },
  { label: "Kam", value: 5200000 },
  { label: "Jum", value: 6100000 },
  { label: "Sab", value: 7200000 },
  { label: "Min", value: 4850000 },
];

export const orderStatusTrend = [
  { label: "Baru", value: 12 },
  { label: "Diterima", value: 8 },
  { label: "Disiapkan", value: 6 },
  { label: "Siap", value: 3 },
  { label: "Selesai", value: 42 },
];

export const recentOrders: Array<{
  id: string;
  number: string;
  time: string;
  outlet: string;
  total: number;
  paymentStatus: PaymentStatus;
  preparationStatus: PreparationStatus;
}> = [
  {
    id: "order-1",
    number: "KMG-0248",
    time: "2026-11-15T10:42:00+07:00",
    outlet: "RAVIKA Kemang",
    total: 128000,
    paymentStatus: "PAID",
    preparationStatus: "PREPARING",
  },
  {
    id: "order-2",
    number: "KMG-0247",
    time: "2026-11-15T10:36:00+07:00",
    outlet: "RAVIKA Kemang",
    total: 76000,
    paymentStatus: "PARTIALLY_PAID",
    preparationStatus: "READY",
  },
  {
    id: "order-3",
    number: "SNP-0119",
    time: "2026-11-15T10:31:00+07:00",
    outlet: "RAVIKA Senopati",
    total: 54000,
    paymentStatus: "UNPAID",
    preparationStatus: "NEW",
  },
  {
    id: "order-4",
    number: "KMG-0246",
    time: "2026-11-15T10:18:00+07:00",
    outlet: "RAVIKA Kemang",
    total: 212000,
    paymentStatus: "PAID",
    preparationStatus: "COMPLETED",
  },
  {
    id: "order-5",
    number: "KMG-0245",
    time: "2026-11-15T10:05:00+07:00",
    outlet: "RAVIKA Kemang",
    total: 98000,
    paymentStatus: "REFUNDED",
    preparationStatus: "CANCELLED",
  },
];
