export type UserRole = "OWNER" | "CASHIER" | "KITCHEN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  roleLabel: string;
  permissions: string[];
};
