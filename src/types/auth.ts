export type UserRole = "OWNER" | "CASHIER" | "BARISTA";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  roleLabel: string;
  permissions: string[];
};
