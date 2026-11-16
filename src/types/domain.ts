import type { PaymentStatus, PreparationStatus } from "@/types/ui";

export type Business = {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  priceAdjustment: number;
  isActive: boolean;
};

export type AddOn = {
  id: string;
  businessId: string;
  name: string;
  price: number;
  isActive: boolean;
};

export type ProductAddOn = {
  addOnId: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
};

export type Product = {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  isAvailable: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  addOns: ProductAddOn[];
  createdAt: string;
  updatedAt: string;
};

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "INACTIVE";

export type DiningTable = {
  id: string;
  outletId: string;
  name: string;
  status: TableStatus;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = "OWNER" | "CASHIER" | "BARISTA";

export type ManagementUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  outletIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  name: string;
  code: UserRole | string;
  description: string;
  isSystem: boolean;
  permissionCodes: string[];
};

export type Permission = {
  code: string;
  label: string;
  group: string;
};

export type OrderType = "DINE_IN" | "TAKEAWAY";
export type OrderSource = "CASHIER" | "QR";
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER" | "E_WALLET";

export type OrderItemAddOn = {
  id: string;
  addOnId: string | null;
  name: string;
  price: number;
  quantity: number;
};

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes: string;
  addOns: OrderItemAddOn[];
};

export type Order = {
  id: string;
  businessId: string;
  outletId: string;
  orderNumber: string;
  orderType: OrderType;
  source: OrderSource;
  tableId: string | null;
  orderStatus: PreparationStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  grandTotal: number;
  notes: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type Payment = {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: "RECORDED" | "REFUNDED";
  reference: string;
  notes: string;
  recordedBy: string;
  paidAt: string;
  createdAt: string;
};

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  previousStatus: PreparationStatus | null;
  newStatus: PreparationStatus;
  changedBy: string | null;
  reason: string;
  createdAt: string;
};

export type LicenseStatus = "VALID" | "EXPIRING" | "INVALID";

export type License = {
  id: string;
  businessIdentifier: string;
  installationId: string;
  issuedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  publicKeyFingerprint: string;
};

export type BackupStatus = "READY" | "IN_PROGRESS" | "FAILED";

export type BackupRecord = {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  status: BackupStatus;
  createdBy: string;
  createdAt: string;
};

export type DashboardSummary = {
  salesTotal: number;
  paidTotal: number;
  transactionCount: number;
  averageTransaction: number;
  itemsSold: number;
  queue: Array<{
    status: PreparationStatus;
    label: string;
    count: number;
  }>;
  salesTrend: Array<{ label: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  recentOrders: Order[];
};

export type SalesReport = {
  salesTotal: number;
  paidTotal: number;
  transactionCount: number;
  averageTransaction: number;
  salesTrend: Array<{ label: string; value: number }>;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  orders: Order[];
};
