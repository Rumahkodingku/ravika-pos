import type { LucideIcon } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type Size = "sm" | "md" | "lg";

export type Tone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED";

export type PreparationStatus =
  | "NEW"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  description: string;
};

export type NavGroup = {
  label: string;
  description?: string;
  items: NavItem[];
};

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  description?: string;
};

export type ServiceFlowStep = {
  id: string;
  label: string;
  count?: number;
  state: "complete" | "current" | "upcoming" | "cancelled";
};

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};
