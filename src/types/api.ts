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
