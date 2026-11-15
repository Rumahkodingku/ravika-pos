import type { SessionUser } from "@/types/auth";

const ownerPermissions = [
  "dashboard.view",
  "business.view",
  "business.update",
  "outlets.view",
  "outlets.manage",
  "users.view",
  "users.manage",
  "roles.manage",
  "permissions.manage",
  "categories.view",
  "categories.manage",
  "products.view",
  "products.manage",
  "tables.view",
  "tables.manage",
  "orders.view",
  "orders.create",
  "orders.cancel",
  "payments.view",
  "payments.create",
  "payments.refund",
  "kds.view",
  "kds.update_status",
  "reports.view",
  "backup.create",
  "backup.restore",
  "settings.manage",
  "license.view",
];

const cashierPermissions = [
  "dashboard.view",
  "business.view",
  "outlets.view",
  "categories.view",
  "products.view",
  "tables.view",
  "tables.manage",
  "orders.view",
  "orders.create",
  "payments.view",
  "payments.create",
];

const baristaPermissions = [
  "outlets.view",
  "categories.view",
  "products.view",
  "tables.view",
  "orders.view",
  "kds.view",
  "kds.update_status",
];

export const mockUsers: SessionUser[] = [
  {
    id: "user-owner",
    name: "Rina Pemilik",
    role: "OWNER",
    roleLabel: "Pemilik",
    outletIds: ["outlet-kemang", "outlet-senopati"],
    permissions: ownerPermissions,
  },
  {
    id: "user-cashier",
    name: "Bagas Kasir",
    role: "CASHIER",
    roleLabel: "Kasir",
    outletIds: ["outlet-kemang"],
    permissions: cashierPermissions,
  },
  {
    id: "user-barista",
    name: "Nadia Barista",
    role: "BARISTA",
    roleLabel: "Barista",
    outletIds: ["outlet-kemang"],
    permissions: baristaPermissions,
  },
];

export const mockCurrentUser = mockUsers[0];

export function hasPermission(user: SessionUser, permission: string) {
  return user.permissions.includes(permission);
}
