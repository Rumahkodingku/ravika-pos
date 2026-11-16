export type PermissionDefinition = {
  code: string;
  label: string;
};

export type PermissionGroup = {
  label: string;
  permissions: PermissionDefinition[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    label: "Dashboard",
    permissions: [{ code: "dashboard.view", label: "Lihat dashboard" }],
  },
  {
    label: "Bisnis",
    permissions: [
      { code: "business.view", label: "Lihat profil bisnis" },
      { code: "business.update", label: "Ubah profil bisnis" },
    ],
  },
  {
    label: "Outlet",
    permissions: [
      { code: "outlets.view", label: "Lihat outlet" },
      { code: "outlets.manage", label: "Kelola outlet" },
    ],
  },
  {
    label: "Pengguna",
    permissions: [
      { code: "users.view", label: "Lihat pengguna" },
      { code: "users.manage", label: "Kelola pengguna" },
    ],
  },
  {
    label: "Peran",
    permissions: [
      { code: "roles.manage", label: "Kelola peran" },
      { code: "permissions.manage", label: "Kelola izin" },
    ],
  },
  {
    label: "Kategori",
    permissions: [
      { code: "categories.view", label: "Lihat kategori" },
      { code: "categories.manage", label: "Kelola kategori" },
    ],
  },
  {
    label: "Produk",
    permissions: [
      { code: "products.view", label: "Lihat produk" },
      { code: "products.manage", label: "Kelola produk" },
    ],
  },
  {
    label: "Meja",
    permissions: [
      { code: "tables.view", label: "Lihat meja" },
      { code: "tables.manage", label: "Kelola meja" },
    ],
  },
  {
    label: "Pesanan",
    permissions: [
      { code: "orders.view", label: "Lihat pesanan" },
      { code: "orders.create", label: "Buat pesanan" },
      { code: "orders.cancel", label: "Batalkan pesanan" },
    ],
  },
  {
    label: "Pembayaran",
    permissions: [
      { code: "payments.view", label: "Lihat pembayaran" },
      { code: "payments.create", label: "Catat pembayaran" },
      { code: "payments.refund", label: "Catat refund" },
    ],
  },
  {
    label: "KDS",
    permissions: [
      { code: "kds.view", label: "Lihat KDS" },
      { code: "kds.update_status", label: "Ubah status KDS" },
    ],
  },
  {
    label: "Laporan",
    permissions: [{ code: "reports.view", label: "Lihat laporan" }],
  },
  {
    label: "Backup",
    permissions: [
      { code: "backup.create", label: "Buat backup" },
      { code: "backup.restore", label: "Restore backup" },
    ],
  },
  {
    label: "Pengaturan",
    permissions: [{ code: "settings.manage", label: "Kelola pengaturan" }],
  },
  {
    label: "Lisensi",
    permissions: [{ code: "license.view", label: "Lihat lisensi" }],
  },
];

export const allPermissionCodes = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => permission.code),
);

export const ownerPermissionCodes = allPermissionCodes;

export const cashierPermissionCodes = [
  "dashboard.view",
  "business.view",
  "outlets.view",
  "categories.view",
  "products.view",
  "tables.view",
  "tables.manage",
  "orders.view",
  "orders.create",
  "orders.cancel",
  "payments.view",
  "payments.create",
];

export const baristaPermissionCodes = [
  "outlets.view",
  "categories.view",
  "products.view",
  "tables.view",
  "orders.view",
  "kds.view",
  "kds.update_status",
];

export const permissionLabelByCode = new Map(
  permissionGroups.flatMap((group) =>
    group.permissions.map((permission) => [permission.code, permission.label]),
  ),
);
