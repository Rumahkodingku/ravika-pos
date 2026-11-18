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
