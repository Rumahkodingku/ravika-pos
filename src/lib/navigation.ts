import {
  Armchair,
  BadgeCheck,
  BarChart3,
  ChefHat,
  ClipboardList,
  DatabaseBackup,
  LayoutDashboard,
  Monitor,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import type { NavGroup, QuickAction } from "@/types/ui";

export const megaMenuGroups: NavGroup[] = [
  {
    label: "Ringkasan",
    description: "Ringkasan operasional hari ini",
    items: [
      {
        label: "Dashboard",
        href: "/app",
        icon: LayoutDashboard,
        permission: "dashboard.view",
        description: "Ringkasan penjualan dan antrean hari ini",
      },
    ],
  },
  {
    label: "Operasional",
    description: "Alur pesanan, POS, KDS, dan meja",
    items: [
      {
        label: "Pesanan",
        href: "/app/orders",
        icon: ClipboardList,
        permission: "orders.view",
        description: "Cari, periksa, dan kelola status pesanan",
      },
      {
        label: "Pembayaran",
        href: "/app/payments",
        icon: Wallet,
        permission: "payments.view",
        description: "Periksa pembayaran yang sudah tercatat",
      },
      {
        label: "POS",
        href: "/app/pos",
        icon: Monitor,
        permission: "orders.create",
        description: "Buat pesanan baru untuk dine-in atau takeaway",
      },
      {
        label: "KDS",
        href: "/kds",
        icon: ChefHat,
        permission: "kds.view",
        description: "Pantau dan ubah status persiapan pesanan",
      },
      {
        label: "Meja",
        href: "/app/tables",
        icon: Armchair,
        permission: "tables.view",
        description: "Kelola meja dan QR ordering",
      },
    ],
  },
  {
    label: "Katalog",
    description: "Menu, kategori, dan ketersediaan produk",
    items: [
      {
        label: "Produk",
        href: "/app/products",
        icon: Package,
        permission: "products.view",
        description: "Atur menu, harga, varian, dan add-on",
      },
      {
        label: "Kategori",
        href: "/app/categories",
        icon: Tags,
        permission: "categories.view",
        description: "Susun kategori untuk menu pelanggan",
      },
    ],
  },
  {
    label: "Bisnis",
    description: "Pengguna dan akses",
    items: [
      {
        label: "Pengguna",
        href: "/app/users",
        icon: Users,
        permission: "users.view",
        description: "Atur akses staf dan status akun",
      },
      {
        label: "Peran & Izin",
        href: "/app/roles",
        icon: ShieldCheck,
        permission: "roles.manage",
        description: "Tentukan izin untuk setiap peran",
      },
    ],
  },
  {
    label: "Analitik",
    description: "Laporan penjualan dan performa produk",
    items: [
      {
        label: "Laporan",
        href: "/app/reports",
        icon: BarChart3,
        permission: "reports.view",
        description: "Lihat penjualan dan produk terlaris",
      },
    ],
  },
  {
    label: "Sistem",
    description: "Pengaturan, backup, dan lisensi",
    items: [
      {
        label: "Pengaturan",
        href: "/app/settings",
        icon: Settings,
        permission: "settings.manage",
        description: "Konfigurasi bisnis dan sistem",
      },
      {
        label: "Backup",
        href: "/app/backup",
        icon: DatabaseBackup,
        permission: "backup.create",
        description: "Cadangkan dan pulihkan data lokal",
      },
      {
        label: "Lisensi",
        href: "/app/license",
        icon: BadgeCheck,
        permission: "license.view",
        description: "Periksa status lisensi instalasi",
      },
    ],
  },
];

export const quickNavigation = megaMenuGroups
  .flatMap((group) => group.items)
  .filter((item) =>
    ["/app", "/app/orders", "/app/pos", "/kds"].includes(item.href),
  );

export const quickActions: QuickAction[] = [
  {
    label: "Buat pesanan",
    href: "/app/pos",
    icon: ShoppingCart,
    permission: "orders.create",
    description: "Mulai transaksi baru",
  },
  {
    label: "Buka KDS",
    href: "/kds",
    icon: ChefHat,
    permission: "kds.view",
    description: "Lihat antrean persiapan",
  },
  {
    label: "Tambah produk",
    href: "/app/products",
    icon: Package,
    permission: "products.manage",
    description: "Perbarui menu",
  },
];

export const managementNavigation = megaMenuGroups;
