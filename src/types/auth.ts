export type UserRole = "OWNER" | "CASHIER" | "BARISTA";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  roleLabel: string;
  permissions: string[];
};
