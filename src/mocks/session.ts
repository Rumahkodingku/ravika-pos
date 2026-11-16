import {
  baristaPermissionCodes,
  cashierPermissionCodes,
  ownerPermissionCodes,
} from "@/mocks/permissions";
import type { SessionUser } from "@/types/auth";

export const mockUsers: SessionUser[] = [
  {
    id: "user-owner",
    name: "Rina Pemilik",
    email: "owner@ravika.id",
    username: "owner",
    role: "OWNER",
    roleLabel: "Pemilik",
    outletIds: ["outlet-kemang", "outlet-senopati"],
    permissions: ownerPermissionCodes,
  },
  {
    id: "user-cashier",
    name: "Bagas Kasir",
    email: "cashier@ravika.id",
    username: "cashier",
    role: "CASHIER",
    roleLabel: "Kasir",
    outletIds: ["outlet-kemang"],
    permissions: cashierPermissionCodes,
  },
  {
    id: "user-barista",
    name: "Nadia Barista",
    email: "barista@ravika.id",
    username: "barista",
    role: "BARISTA",
    roleLabel: "Barista",
    outletIds: ["outlet-kemang"],
    permissions: baristaPermissionCodes,
  },
];
