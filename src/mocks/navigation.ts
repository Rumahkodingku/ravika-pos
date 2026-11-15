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
  Store,
  Tags,
  Users,
} from "lucide-react";
import type { NavGroup } from "@/types/ui";

export const managementNavigation: NavGroup[] = [
  {
    label: "Ringkasan",
    items: [
      {
        label: "Dashboard",
        href: "/app",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    label: "Operasional",
    items: [
      {
        label: "Pesanan",
        href: "/app/orders",
        icon: ClipboardList,
        permission: "orders.view",
      },
      {
        label: "POS",
        href: "/app/pos",
        icon: Monitor,
        permission: "orders.create",
      },
      {
        label: "KDS",
        href: "/kds",
        icon: ChefHat,
        permission: "kds.view",
      },
      {
        label: "Meja",
        href: "/app/tables",
        icon: Armchair,
        permission: "tables.view",
      },
    ],
  },
  {
    label: "Katalog",
    items: [
      {
        label: "Produk",
        href: "/app/products",
        icon: Package,
        permission: "products.view",
      },
      {
        label: "Kategori",
        href: "/app/categories",
        icon: Tags,
        permission: "categories.view",
      },
    ],
  },
  {
    label: "Bisnis",
    items: [
      {
        label: "Outlet",
        href: "/app/outlets",
        icon: Store,
        permission: "outlets.view",
      },
      {
        label: "Pengguna",
        href: "/app/users",
        icon: Users,
        permission: "users.view",
      },
      {
        label: "Peran & Izin",
        href: "/app/roles",
        icon: ShieldCheck,
        permission: "roles.manage",
      },
    ],
  },
  {
    label: "Analitik",
    items: [
      {
        label: "Laporan",
        href: "/app/reports",
        icon: BarChart3,
        permission: "reports.view",
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        label: "Pengaturan",
        href: "/app/settings",
        icon: Settings,
        permission: "settings.manage",
      },
      {
        label: "Backup",
        href: "/app/backup",
        icon: DatabaseBackup,
        permission: "backup.create",
      },
      {
        label: "Lisensi",
        href: "/app/license",
        icon: BadgeCheck,
        permission: "license.view",
      },
    ],
  },
];

export const primaryNavigation = managementNavigation
  .flatMap((group) => group.items)
  .filter((item) =>
    [
      "/app",
      "/app/orders",
      "/app/pos",
      "/kds",
      "/app/products",
      "/app/reports",
    ].includes(item.href),
  );
