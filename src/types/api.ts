import type { AddOn, ProductAddOn, ProductVariant } from "@/types/domain";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  errors?: ValidationIssue[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type BaseListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  orderStatus?: string;
  orderType?: string;
  paymentStatus?: string;
  range?: string;
  source?: string;
};

export type ProductListParams = BaseListParams & {
  categoryId?: string;
  active?: string;
  availability?: string;
};

export type CategoryListParams = BaseListParams & { active?: string };

export type TableListParams = BaseListParams & { status?: string };

export type OrderListParams = BaseListParams & {
  orderStatus?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type PaymentListParams = BaseListParams & {
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type UserListParams = BaseListParams & {
  role?: string;
  active?: string;
};

export type SalesReportParams = BaseListParams & {
  dateFrom?: string;
  dateTo?: string;
};

export type TopProductsParams = SalesReportParams & { limit?: number };

export type PublicMenuResponse = {
  business: { name: string; address: string };
  table: { id: string; name: string };
  categories: Array<{ id: string; name: string }>;
  products: Array<{
    id: string;
    categoryId: string;
    name: string;
    description: string;
    imageUrl: string | null;
    basePrice: number;
    variants: ProductVariant[];
    addOns: ProductAddOn[];
  }>;
  addOns: AddOn[];
};
