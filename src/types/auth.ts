export type UserRole = "OWNER" | "CASHIER" | "BARISTA";

export type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  outletIds: string[];
  permissions: string[];
};

export type Outlet = {
  id: string;
  name: string;
  code: string;
  city: string;
};
