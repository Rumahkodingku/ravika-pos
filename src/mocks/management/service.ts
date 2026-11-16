import { consumeFailure, getLatency } from "@/mocks/management/controls";
import { getState, setState } from "@/mocks/management/store";
import type { Outlet } from "@/types/auth";
import type {
  BackupRecord,
  Category,
  DashboardSummary,
  DiningTable,
  ManagementUser,
  Order,
  OrderItem,
  OrderItemAddOn,
  OrderStatusHistory,
  Payment,
  PaymentMethod,
  Product,
  ProductAddOn,
  ProductVariant,
  Role,
  SalesReport,
  TableStatus,
  UserRole,
} from "@/types/domain";
import type { PaymentStatus, PreparationStatus } from "@/types/ui";

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
  outletId?: string;
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
export type OutletListParams = BaseListParams & { active?: string };

export type ProductInput = {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  isAvailable: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  addOns: ProductAddOn[];
};

export type CategoryInput = {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

export type TableInput = {
  name: string;
  outletId: string;
  status: TableStatus;
  isActive: boolean;
};

export type UserInput = {
  name: string;
  email: string;
  role: UserRole;
  outletIds: string[];
  isActive: boolean;
};

export type RoleInput = {
  name: string;
  code: string;
  description: string;
  permissionCodes: string[];
};

export type OutletInput = {
  name: string;
  code: string;
  city: string;
  address: string;
  isActive: boolean;
};

export type BusinessInput = {
  name: string;
  code: string;
  address: string;
  phone: string;
};

export type CreateOrderItemInput = {
  productId: string;
  variantId: string | null;
  addOnIds: string[];
  quantity: number;
  notes: string;
};

export type CreateOrderInput = {
  outletId: string;
  orderType: "DINE_IN" | "TAKEAWAY";
  tableId: string | null;
  tableToken?: string | null;
  source: "CASHIER" | "QR";
  createdBy: string | null;
  notes: string;
  items: CreateOrderItemInput[];
};

export type RecordPaymentInput = {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  reference: string;
  notes: string;
  actorId: string;
};

export type OrderStatusUpdateInput = {
  orderId: string;
  nextStatus: "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED";
  actorId: string;
};

async function respondAfter<T>(work: () => T, ms: number): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  if (consumeFailure()) {
    throw new Error("Simulasi gagal. Coba lagi.");
  }
  return work();
}

function respond<T>(work: () => T) {
  return respondAfter(work, getLatency());
}

function pageOf<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    total,
    pageCount,
  };
}

function textMatch(value: string, search?: string) {
  return !search || value.toLowerCase().includes(search.toLowerCase());
}

function sortText(
  left: string,
  right: string,
  direction: "asc" | "desc" = "asc",
) {
  return direction === "asc"
    ? left.localeCompare(right)
    : right.localeCompare(left);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function activeOwnerCount() {
  return getState().users.filter(
    (user) => user.role === "OWNER" && user.isActive,
  ).length;
}

function getOrderPayments(orderId: string) {
  return getState().payments.filter((payment) => payment.orderId === orderId);
}

function getDateStart(range: string) {
  const now = new Date("2026-11-16T23:59:59+07:00");
  const start = new Date(now);

  if (range === "7d") {
    start.setDate(start.getDate() - 6);
  } else if (range === "30d") {
    start.setDate(start.getDate() - 29);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function inRange(iso: string, start: Date, end: Date) {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function sumPayments(orderIds: string[]) {
  return getState()
    .payments.filter((payment) => orderIds.includes(payment.orderId))
    .reduce((total, payment) => total + payment.amount, 0);
}

const activeOrderStatuses: PreparationStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
];

function remainingAmount(order: Order) {
  const paid = getState()
    .payments.filter(
      (payment) =>
        payment.orderId === order.id && payment.status === "RECORDED",
    )
    .reduce((total, payment) => total + payment.amount, 0);

  return Math.max(0, order.grandTotal - paid);
}

function activeOrdersForTable(tableId: string) {
  return getState().orders.filter(
    (order) =>
      order.tableId === tableId &&
      activeOrderStatuses.includes(order.orderStatus),
  );
}

function nextOrderNumber(outletId: string) {
  const outlet = getState().outlets.find(
    (candidate) => candidate.id === outletId,
  );

  if (!outlet) {
    throw new Error("Outlet tidak ditemukan.");
  }

  const highest = getState()
    .orders.filter((order) => order.outletId === outletId)
    .map((order) =>
      Number.parseInt(order.orderNumber.split("-").at(-1) ?? "", 10),
    )
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 2000);

  return `${outlet.code}-${highest + 1}`;
}

function makePublicToken() {
  return makeId("public");
}

function calculateOrderItems(items: CreateOrderItemInput[]): OrderItem[] {
  if (items.length === 0) {
    throw new Error("Pesanan minimal memiliki satu item.");
  }

  const state = getState();

  return items.map((item, index) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Kuantitas item minimal 1.");
    }

    const product = state.products.find(
      (candidate) => candidate.id === item.productId,
    );

    if (!product || !product.isActive || !product.isAvailable) {
      throw new Error("Produk tidak tersedia.");
    }

    const activeVariants = product.variants.filter(
      (variant) => variant.isActive,
    );
    let variant: ProductVariant | null = null;

    if (activeVariants.length > 0) {
      variant =
        activeVariants.find((candidate) => candidate.id === item.variantId) ??
        null;

      if (!variant) {
        throw new Error(`Varian ${product.name} wajib dipilih.`);
      }
    } else if (item.variantId) {
      throw new Error(`Produk ${product.name} tidak memiliki varian.`);
    }

    const selectedIds = Array.from(new Set(item.addOnIds));
    const selected = selectedIds.map((addOnId) => {
      const addOn = state.addOns.find(
        (candidate) => candidate.id === addOnId && candidate.isActive,
      );
      const relation = product.addOns.find(
        (candidate) => candidate.addOnId === addOnId,
      );

      if (!addOn || !relation) {
        throw new Error(`Add-on ${product.name} tidak valid.`);
      }

      return { addOn, relation };
    });

    for (const relation of product.addOns) {
      const count = selectedIds.filter(
        (addOnId) => addOnId === relation.addOnId,
      ).length;

      if (relation.isRequired && count === 0) {
        throw new Error(`Add-on wajib untuk ${product.name} belum dipilih.`);
      }
      if (count < relation.minSelection) {
        throw new Error(`Jumlah add-on ${product.name} kurang.`);
      }
      if (count > relation.maxSelection) {
        throw new Error(`Jumlah add-on ${product.name} melebihi batas.`);
      }
    }

    const addOns: OrderItemAddOn[] = selected.map(({ addOn }) => ({
      id: makeId("order-addon"),
      addOnId: addOn.id,
      name: addOn.name,
      price: addOn.price,
      quantity: 1,
    }));
    const unitPrice =
      product.basePrice +
      (variant?.priceAdjustment ?? 0) +
      addOns.reduce((total, addOn) => total + addOn.price, 0);

    return {
      id: makeId(`order-item-${index}`),
      productId: product.id,
      productName: product.name,
      variantName: variant?.name ?? null,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      notes: item.notes,
      addOns,
    };
  });
}

function buildTopProducts(orders: Order[]) {
  const productMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const current = productMap.get(item.productName) ?? {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.lineTotal;
      productMap.set(item.productName, current);
    });
  });

  return Array.from(productMap.values())
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 4);
}

function buildTrend(orders: Order[]) {
  const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const now = new Date("2026-11-16T23:59:59+07:00");

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const value = orders
      .filter((order) => order.createdAt.slice(0, 10) === key)
      .reduce((total, order) => total + order.grandTotal, 0);

    return { label: labels[index], value };
  });
}

function buildDashboard(params: {
  outletId?: string;
  range?: string;
}): DashboardSummary {
  const start = getDateStart(params.range ?? "today");
  const end = new Date("2026-11-16T23:59:59+07:00");
  const orders = getState().orders.filter(
    (order) =>
      (!params.outletId ||
        params.outletId === "all" ||
        order.outletId === params.outletId) &&
      order.orderStatus !== "CANCELLED" &&
      inRange(order.createdAt, start, end),
  );
  const salesTotal = orders.reduce(
    (total, order) => total + order.grandTotal,
    0,
  );
  const paidTotal = sumPayments(orders.map((order) => order.id));
  const transactionCount = orders.length;
  const itemsSold = orders.reduce(
    (total, order) =>
      total + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );
  const queueStatuses: PreparationStatus[] = [
    "NEW",
    "ACCEPTED",
    "PREPARING",
    "READY",
  ];
  const queueLabels: Record<PreparationStatus, string> = {
    NEW: "Baru",
    ACCEPTED: "Diterima",
    PREPARING: "Disiapkan",
    READY: "Siap",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };

  return {
    salesTotal,
    paidTotal,
    transactionCount,
    averageTransaction:
      transactionCount > 0 ? Math.round(salesTotal / transactionCount) : 0,
    itemsSold,
    queue: queueStatuses.map((status) => ({
      status,
      label: queueLabels[status],
      count: orders.filter((order) => order.orderStatus === status).length,
    })),
    salesTrend: buildTrend(orders),
    topProducts: buildTopProducts(orders),
    recentOrders: orders
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
  };
}

export const managementService = {
  getDashboard: (params: { outletId?: string; range?: string }) =>
    respond(() => buildDashboard(params)),

  listProducts: (params: ProductListParams = {}) =>
    respond(() => {
      let items = getState().products.filter(
        (product) =>
          textMatch(product.name, params.search) &&
          (!params.categoryId ||
            params.categoryId === "all" ||
            product.categoryId === params.categoryId) &&
          (!params.active ||
            params.active === "all" ||
            String(product.isActive) === params.active) &&
          (!params.availability ||
            params.availability === "all" ||
            String(product.isAvailable) === params.availability),
      );

      if (params.sortBy === "price") {
        items = items.sort((left, right) =>
          params.sortDir === "desc"
            ? right.basePrice - left.basePrice
            : left.basePrice - right.basePrice,
        );
      } else if (params.sortBy === "category") {
        const categoryName = (id: string) =>
          getState().categories.find((category) => category.id === id)?.name ??
          "";
        items = items.sort((left, right) =>
          sortText(
            categoryName(left.categoryId),
            categoryName(right.categoryId),
            params.sortDir,
          ),
        );
      } else {
        items = items.sort((left, right) =>
          sortText(left.name, right.name, params.sortDir),
        );
      }

      return pageOf(items, params.page, params.pageSize);
    }),

  getProduct: (id: string) =>
    respond(
      () => getState().products.find((product) => product.id === id) ?? null,
    ),

  createProduct: (input: ProductInput) =>
    respond(() => {
      const product: Product = {
        ...input,
        id: makeId("product"),
        businessId: getState().business.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setState((state) => ({
        ...state,
        products: [product, ...state.products],
      }));
      return product;
    }),

  updateProduct: (id: string, input: ProductInput) =>
    respond(() => {
      setState((state) => ({
        ...state,
        products: state.products.map((product) =>
          product.id === id
            ? { ...product, ...input, updatedAt: nowIso() }
            : product,
        ),
      }));
      return getState().products.find((product) => product.id === id) ?? null;
    }),

  setProductActive: (id: string, isActive: boolean) =>
    respond(() => {
      setState((state) => ({
        ...state,
        products: state.products.map((product) =>
          product.id === id
            ? { ...product, isActive, updatedAt: nowIso() }
            : product,
        ),
      }));
    }),

  setProductAvailability: (id: string, isAvailable: boolean) =>
    respond(() => {
      setState((state) => ({
        ...state,
        products: state.products.map((product) =>
          product.id === id
            ? { ...product, isAvailable, updatedAt: nowIso() }
            : product,
        ),
      }));
    }),

  listCategories: (params: CategoryListParams = {}) =>
    respond(() => {
      const items = getState()
        .categories.filter(
          (category) =>
            textMatch(category.name, params.search) &&
            (!params.active ||
              params.active === "all" ||
              String(category.isActive) === params.active),
        )
        .sort((left, right) => left.sortOrder - right.sortOrder);

      return pageOf(items, params.page, params.pageSize);
    }),

  createCategory: (input: CategoryInput) =>
    respond(() => {
      const category: Category = {
        ...input,
        id: makeId("category"),
        businessId: getState().business.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setState((state) => ({
        ...state,
        categories: [...state.categories, category],
      }));
      return category;
    }),

  updateCategory: (id: string, input: CategoryInput) =>
    respond(() => {
      setState((state) => ({
        ...state,
        categories: state.categories.map((category) =>
          category.id === id
            ? { ...category, ...input, updatedAt: nowIso() }
            : category,
        ),
      }));
    }),

  moveCategory: (id: string, direction: "up" | "down") =>
    respond(() => {
      const categories = getState()
        .categories.slice()
        .sort((left, right) => left.sortOrder - right.sortOrder);
      const index = categories.findIndex((category) => category.id === id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= categories.length) {
        return;
      }
      const current = categories[index];
      const next = categories[target];
      setState((state) => ({
        ...state,
        categories: state.categories.map((category) => {
          if (category.id === current.id) {
            return { ...category, sortOrder: next.sortOrder };
          }
          if (category.id === next.id) {
            return { ...category, sortOrder: current.sortOrder };
          }
          return category;
        }),
      }));
    }),

  setCategoryActive: (id: string, isActive: boolean) =>
    respond(() => {
      setState((state) => ({
        ...state,
        categories: state.categories.map((category) =>
          category.id === id
            ? { ...category, isActive, updatedAt: nowIso() }
            : category,
        ),
      }));
    }),

  listTables: (params: TableListParams = {}) =>
    respond(() => {
      const items = getState()
        .tables.filter(
          (table) =>
            textMatch(table.name, params.search) &&
            (!params.outletId ||
              params.outletId === "all" ||
              table.outletId === params.outletId) &&
            (!params.status ||
              params.status === "all" ||
              table.status === params.status),
        )
        .sort((left, right) => sortText(left.name, right.name));
      return pageOf(items, params.page, params.pageSize);
    }),

  createTable: (input: TableInput) =>
    respond(() => {
      const table: DiningTable = {
        ...input,
        id: makeId("table"),
        qrToken: makeId("token"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setState((state) => ({ ...state, tables: [...state.tables, table] }));
      return table;
    }),

  updateTable: (id: string, input: TableInput) =>
    respond(() => {
      if (
        activeOrdersForTable(id).length > 0 &&
        (input.status === "AVAILABLE" ||
          input.status === "INACTIVE" ||
          input.isActive === false)
      ) {
        throw new Error(
          "Meja masih memiliki pesanan aktif. Selesaikan atau batalkan pesanan terlebih dahulu.",
        );
      }
      setState((state) => ({
        ...state,
        tables: state.tables.map((table) =>
          table.id === id ? { ...table, ...input, updatedAt: nowIso() } : table,
        ),
      }));
    }),

  setTableStatus: (id: string, status: TableStatus) =>
    respond(() => {
      if (
        activeOrdersForTable(id).length > 0 &&
        (status === "AVAILABLE" || status === "INACTIVE")
      ) {
        throw new Error(
          "Meja masih memiliki pesanan aktif. Selesaikan atau batalkan pesanan terlebih dahulu.",
        );
      }
      setState((state) => ({
        ...state,
        tables: state.tables.map((table) =>
          table.id === id ? { ...table, status, updatedAt: nowIso() } : table,
        ),
      }));
    }),

  regenerateTableToken: (id: string) =>
    respond(() => {
      const token = makeId("token");
      setState((state) => ({
        ...state,
        tables: state.tables.map((table) =>
          table.id === id
            ? { ...table, qrToken: token, updatedAt: nowIso() }
            : table,
        ),
      }));
      return token;
    }),

  createOrder: (input: CreateOrderInput) =>
    respond(() => {
      const current = getState();
      const outlet = current.outlets.find(
        (candidate) => candidate.id === input.outletId,
      );

      if (!outlet || outlet.isActive === false) {
        throw new Error("Outlet tidak ditemukan atau tidak aktif.");
      }
      if (input.source === "CASHIER" && !input.createdBy) {
        throw new Error("Kasir wajib dikenali untuk pesanan ini.");
      }
      if (input.source === "QR" && input.createdBy) {
        throw new Error("Pesanan QR tidak memiliki pengguna internal.");
      }
      if (input.orderType === "DINE_IN" && !input.tableId) {
        throw new Error("Pesanan dine-in wajib memilih meja.");
      }
      if (input.orderType === "TAKEAWAY" && input.tableId) {
        throw new Error("Pesanan takeaway tidak memakai meja.");
      }
      if (input.source === "QR" && input.orderType !== "DINE_IN") {
        throw new Error("Takeaway QR belum tersedia di Fase 3.");
      }

      let table: DiningTable | null = null;

      if (input.tableId) {
        table =
          current.tables.find((candidate) => candidate.id === input.tableId) ??
          null;

        if (!table || table.isActive === false || table.status === "INACTIVE") {
          throw new Error("Meja tidak tersedia.");
        }
        if (table.outletId !== input.outletId) {
          throw new Error("Meja bukan milik outlet ini.");
        }
        if (input.source === "QR" && table.qrToken !== input.tableToken) {
          throw new Error("Token QR sudah tidak berlaku.");
        }
      }

      const items = calculateOrderItems(input.items);
      const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
      const now = nowIso();
      const order: Order = {
        id: makeId("order"),
        businessId: current.business.id,
        outletId: input.outletId,
        orderNumber: nextOrderNumber(input.outletId),
        orderType: input.orderType,
        source: input.source,
        tableId: input.tableId,
        orderStatus: "NEW",
        paymentStatus: "UNPAID",
        publicToken: input.source === "QR" ? makePublicToken() : null,
        subtotal,
        grandTotal: subtotal,
        notes: input.notes,
        createdBy: input.createdBy,
        createdAt: now,
        updatedAt: now,
        items,
      };
      const history: OrderStatusHistory = {
        id: makeId("history"),
        orderId: order.id,
        previousStatus: null,
        newStatus: "NEW",
        changedBy: input.createdBy,
        reason: "",
        createdAt: now,
      };

      setState((state) => ({
        ...state,
        orders: [order, ...state.orders],
        statusHistory: [...state.statusHistory, history],
        tables: table
          ? state.tables.map((candidate) =>
              candidate.id === table.id
                ? { ...candidate, status: "OCCUPIED", updatedAt: now }
                : candidate,
            )
          : state.tables,
      }));

      return order;
    }),

  updateOrderStatus: (input: OrderStatusUpdateInput) =>
    respond(() => {
      const order = getState().orders.find(
        (candidate) => candidate.id === input.orderId,
      );

      if (!order) {
        throw new Error("Pesanan tidak ditemukan.");
      }
      if (!input.actorId) {
        throw new Error("Pengguna perubahan status wajib dikenali.");
      }

      const nextStatus: Record<PreparationStatus, PreparationStatus | null> = {
        NEW: "ACCEPTED",
        ACCEPTED: "PREPARING",
        PREPARING: "READY",
        READY: "COMPLETED",
        COMPLETED: null,
        CANCELLED: null,
      };

      if (nextStatus[order.orderStatus] !== input.nextStatus) {
        throw new Error("Status pesanan tidak dapat diubah ke tahap itu.");
      }

      const now = nowIso();
      const updated: Order = {
        ...order,
        orderStatus: input.nextStatus,
        updatedAt: now,
      };
      const history: OrderStatusHistory = {
        id: makeId("history"),
        orderId: order.id,
        previousStatus: order.orderStatus,
        newStatus: input.nextStatus,
        changedBy: input.actorId,
        reason: "",
        createdAt: now,
      };

      setState((state) => {
        const orders = state.orders.map((candidate) =>
          candidate.id === order.id ? updated : candidate,
        );
        const tables = order.tableId
          ? state.tables.map((table) => {
              if (table.id !== order.tableId || table.status === "INACTIVE") {
                return table;
              }
              const active = orders.some(
                (candidate) =>
                  candidate.tableId === table.id &&
                  activeOrderStatuses.includes(candidate.orderStatus),
              );
              return {
                ...table,
                status: (active ? "OCCUPIED" : "AVAILABLE") as TableStatus,
                updatedAt: now,
              };
            })
          : state.tables;

        return {
          ...state,
          orders,
          statusHistory: [...state.statusHistory, history],
          tables,
        };
      });

      return updated;
    }),

  recordPayment: (input: RecordPaymentInput) =>
    respond(() => {
      const order = getState().orders.find(
        (candidate) => candidate.id === input.orderId,
      );

      if (!order) {
        throw new Error("Pesanan tidak ditemukan.");
      }
      if (order.orderStatus === "CANCELLED") {
        throw new Error("Pesanan dibatalkan tidak dapat dibayar.");
      }
      if (order.paymentStatus === "REFUNDED") {
        throw new Error("Pembayaran pesanan sudah dikembalikan.");
      }
      if (!Number.isInteger(input.amount) || input.amount <= 0) {
        throw new Error("Nominal pembayaran harus lebih dari 0.");
      }
      if (!getState().users.some((user) => user.id === input.actorId)) {
        throw new Error("Pengguna pembayaran tidak ditemukan.");
      }

      const remaining = remainingAmount(order);

      if (remaining <= 0) {
        throw new Error("Pesanan sudah lunas.");
      }
      if (input.amount > remaining) {
        throw new Error("Nominal pembayaran melebihi sisa tagihan.");
      }

      const now = nowIso();
      const payment: Payment = {
        id: makeId("payment"),
        orderId: order.id,
        method: input.method,
        amount: input.amount,
        status: "RECORDED",
        reference: input.reference,
        notes: input.notes,
        recordedBy: input.actorId,
        paidAt: now,
        createdAt: now,
      };
      const nextPaid = remainingAmount(order) - input.amount;
      const paymentStatus: PaymentStatus =
        nextPaid <= 0
          ? "PAID"
          : nextPaid < order.grandTotal
            ? "PARTIALLY_PAID"
            : "UNPAID";
      const updated: Order = { ...order, paymentStatus, updatedAt: now };

      setState((state) => ({
        ...state,
        payments: [payment, ...state.payments],
        orders: state.orders.map((candidate) =>
          candidate.id === order.id ? updated : candidate,
        ),
      }));

      return { payment, order: updated };
    }),

  listPayableOrders: (outletId: string) =>
    respond(() =>
      getState()
        .orders.filter(
          (order) =>
            order.outletId === outletId &&
            order.orderStatus !== "CANCELLED" &&
            (order.paymentStatus === "UNPAID" ||
              order.paymentStatus === "PARTIALLY_PAID"),
        )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    ),

  getOrderByPublicToken: (token: string) =>
    respond(() =>
      token
        ? (getState().orders.find((order) => order.publicToken === token) ??
          null)
        : null,
    ),

  validateTableToken: (token: string) =>
    respond(() => {
      if (!token) {
        return null;
      }

      const table = getState().tables.find(
        (candidate) => candidate.qrToken === token,
      );

      if (!table || table.isActive === false || table.status === "INACTIVE") {
        return null;
      }

      const outlet = getState().outlets.find(
        (candidate) => candidate.id === table.outletId,
      );

      if (!outlet || outlet.isActive === false) {
        return null;
      }

      return { table, outlet };
    }),

  listOrders: (params: OrderListParams = {}) =>
    respond(() => {
      let items = getState().orders.filter(
        (order) =>
          textMatch(order.orderNumber, params.search) &&
          (!params.outletId ||
            params.outletId === "all" ||
            order.outletId === params.outletId) &&
          (!params.orderStatus ||
            params.orderStatus === "all" ||
            order.orderStatus === params.orderStatus) &&
          (!params.paymentStatus ||
            params.paymentStatus === "all" ||
            order.paymentStatus === params.paymentStatus) &&
          (!params.dateFrom ||
            order.createdAt.slice(0, 10) >= params.dateFrom) &&
          (!params.dateTo || order.createdAt.slice(0, 10) <= params.dateTo),
      );
      items = items.sort((left, right) =>
        sortText(
          left.createdAt,
          right.createdAt,
          params.sortDir === "asc" ? "asc" : "desc",
        ),
      );
      return pageOf(items, params.page, params.pageSize);
    }),

  getOrder: (id: string) =>
    respond(() => getState().orders.find((order) => order.id === id) ?? null),

  getOrderHistory: (id: string) =>
    respond(() =>
      getState()
        .statusHistory.filter((history) => history.orderId === id)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    ),

  getOrderPayments: (id: string) => respond(() => getOrderPayments(id)),

  cancelOrder: (id: string, reason: string, actorId: string) =>
    respond(() => {
      const order = getState().orders.find((candidate) => candidate.id === id);
      if (!order) {
        throw new Error("Pesanan tidak ditemukan.");
      }
      if (
        getOrderPayments(id).some((payment) => payment.status === "RECORDED")
      ) {
        throw new Error(
          "Pesanan dengan pembayaran tercatat tidak dapat dibatalkan. Refund belum tersedia di Fase 3.",
        );
      }
      if (!["NEW", "ACCEPTED", "PREPARING"].includes(order.orderStatus)) {
        throw new Error("Status pesanan ini tidak dapat dibatalkan.");
      }
      const now = nowIso();
      const history: OrderStatusHistory = {
        id: makeId("history"),
        orderId: id,
        previousStatus: order.orderStatus,
        newStatus: "CANCELLED",
        changedBy: actorId,
        reason,
        createdAt: now,
      };
      const updated: Order = {
        ...order,
        orderStatus: "CANCELLED",
        updatedAt: now,
      };
      setState((state) => {
        const orders = state.orders.map((candidate) =>
          candidate.id === id ? updated : candidate,
        );
        const tables = order.tableId
          ? state.tables.map((table) => {
              if (table.id !== order.tableId || table.status === "INACTIVE") {
                return table;
              }
              const active = orders.some(
                (candidate) =>
                  candidate.tableId === table.id &&
                  activeOrderStatuses.includes(candidate.orderStatus),
              );
              return {
                ...table,
                status: (active ? "OCCUPIED" : "AVAILABLE") as TableStatus,
                updatedAt: now,
              };
            })
          : state.tables;

        return {
          ...state,
          orders,
          statusHistory: [...state.statusHistory, history],
          tables,
        };
      });
    }),

  listPayments: (params: PaymentListParams = {}) =>
    respond(() => {
      const orders = getState().orders;
      const items = getState()
        .payments.filter((payment) => {
          const order = orders.find(
            (candidate) => candidate.id === payment.orderId,
          );
          return (
            textMatch(order?.orderNumber ?? "", params.search) &&
            (!params.method ||
              params.method === "all" ||
              payment.method === params.method) &&
            (!params.status ||
              params.status === "all" ||
              payment.status === params.status) &&
            (!params.outletId ||
              params.outletId === "all" ||
              order?.outletId === params.outletId) &&
            (!params.dateFrom ||
              payment.paidAt.slice(0, 10) >= params.dateFrom) &&
            (!params.dateTo || payment.paidAt.slice(0, 10) <= params.dateTo)
          );
        })
        .sort((left, right) => right.paidAt.localeCompare(left.paidAt));
      return pageOf(items, params.page, params.pageSize);
    }),

  getPayment: (id: string) =>
    respond(
      () => getState().payments.find((payment) => payment.id === id) ?? null,
    ),

  listUsers: (params: UserListParams = {}) =>
    respond(() => {
      const items = getState()
        .users.filter(
          (user) =>
            (textMatch(user.name, params.search) ||
              textMatch(user.email, params.search)) &&
            (!params.role ||
              params.role === "all" ||
              user.role === params.role) &&
            (!params.active ||
              params.active === "all" ||
              String(user.isActive) === params.active),
        )
        .sort((left, right) => sortText(left.name, right.name));
      return pageOf(items, params.page, params.pageSize);
    }),

  createUser: (input: UserInput) =>
    respond(() => {
      const user: ManagementUser = {
        ...input,
        id: makeId("user"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setState((state) => ({ ...state, users: [user, ...state.users] }));
      return user;
    }),

  updateUser: (id: string, input: UserInput) =>
    respond(() => {
      const current = getState().users.find((user) => user.id === id);
      if (
        current?.role === "OWNER" &&
        (!input.isActive || input.role !== "OWNER") &&
        activeOwnerCount() <= 1
      ) {
        throw new Error("Minimal satu owner aktif harus tersedia.");
      }
      setState((state) => ({
        ...state,
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...input, updatedAt: nowIso() } : user,
        ),
      }));
    }),

  setUserActive: (id: string, isActive: boolean) =>
    respond(() => {
      const current = getState().users.find((user) => user.id === id);
      if (current?.role === "OWNER" && !isActive && activeOwnerCount() <= 1) {
        throw new Error("Minimal satu owner aktif harus tersedia.");
      }
      setState((state) => ({
        ...state,
        users: state.users.map((user) =>
          user.id === id ? { ...user, isActive, updatedAt: nowIso() } : user,
        ),
      }));
    }),

  listRoles: () => respond(() => getState().roles.slice()),

  getRole: (id: string) =>
    respond(() => getState().roles.find((role) => role.id === id) ?? null),

  createRole: (input: RoleInput) =>
    respond(() => {
      const role: Role = {
        ...input,
        id: makeId("role"),
        isSystem: false,
      };
      setState((state) => ({ ...state, roles: [...state.roles, role] }));
      return role;
    }),

  updateRole: (id: string, input: RoleInput) =>
    respond(() => {
      setState((state) => ({
        ...state,
        roles: state.roles.map((role) =>
          role.id === id
            ? {
                ...role,
                name: input.name,
                code: role.isSystem ? role.code : input.code,
                description: input.description,
                permissionCodes: input.permissionCodes,
              }
            : role,
        ),
      }));
    }),

  setRolePermissions: (id: string, permissionCodes: string[]) =>
    respond(() => {
      setState((state) => ({
        ...state,
        roles: state.roles.map((role) =>
          role.id === id ? { ...role, permissionCodes } : role,
        ),
      }));
    }),

  getBusiness: () => respond(() => getState().business),

  updateBusiness: (input: BusinessInput) =>
    respond(() => {
      setState((state) => ({
        ...state,
        business: { ...state.business, ...input, updatedAt: nowIso() },
      }));
    }),

  listOutlets: (params: OutletListParams = {}) =>
    respond(() => {
      const items = getState()
        .outlets.filter(
          (outlet) =>
            (textMatch(outlet.name, params.search) ||
              textMatch(outlet.code, params.search)) &&
            (!params.active ||
              params.active === "all" ||
              String(outlet.isActive) === params.active),
        )
        .sort((left, right) => sortText(left.name, right.name));
      return pageOf(items, params.page, params.pageSize);
    }),

  createOutlet: (input: OutletInput) =>
    respond(() => {
      if (getState().outlets.some((outlet) => outlet.code === input.code)) {
        throw new Error("Kode outlet sudah dipakai.");
      }
      const outlet: Outlet = {
        ...input,
        id: makeId("outlet"),
      };
      setState((state) => ({ ...state, outlets: [...state.outlets, outlet] }));
      return outlet;
    }),

  updateOutlet: (id: string, input: OutletInput) =>
    respond(() => {
      if (
        getState().outlets.some(
          (outlet) => outlet.id !== id && outlet.code === input.code,
        )
      ) {
        throw new Error("Kode outlet sudah dipakai.");
      }
      setState((state) => ({
        ...state,
        outlets: state.outlets.map((outlet) =>
          outlet.id === id ? { ...outlet, ...input } : outlet,
        ),
      }));
    }),

  setOutletActive: (id: string, isActive: boolean) =>
    respond(() => {
      setState((state) => ({
        ...state,
        outlets: state.outlets.map((outlet) =>
          outlet.id === id ? { ...outlet, isActive } : outlet,
        ),
      }));
    }),

  getSalesReport: (params: {
    outletId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    respond(() => {
      const dateFrom = params.dateFrom ?? "2026-11-10";
      const dateTo = params.dateTo ?? "2026-11-16";
      const orders = getState().orders.filter(
        (order) =>
          order.orderStatus !== "CANCELLED" &&
          (!params.outletId ||
            params.outletId === "all" ||
            order.outletId === params.outletId) &&
          order.createdAt.slice(0, 10) >= dateFrom &&
          order.createdAt.slice(0, 10) <= dateTo,
      );
      const salesTotal = orders.reduce(
        (total, order) => total + order.grandTotal,
        0,
      );
      const paidTotal = sumPayments(orders.map((order) => order.id));
      const transactionCount = orders.length;

      const report: SalesReport = {
        salesTotal,
        paidTotal,
        transactionCount,
        averageTransaction:
          transactionCount > 0 ? Math.round(salesTotal / transactionCount) : 0,
        salesTrend: buildTrend(orders),
        topProducts: buildTopProducts(orders),
        orders: orders.sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      };
      return report;
    }),

  getLicense: () => respond(() => getState().license),

  listBackups: () =>
    respond(() =>
      getState()
        .backups.slice()
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    ),

  createBackup: (actorId: string) =>
    respondAfter(() => {
      const backup: BackupRecord = {
        id: makeId("backup"),
        fileName: `ravika-${new Date().toISOString().slice(0, 10)}.sqlite`,
        filePath: `/backup/ravika-${new Date().toISOString().slice(0, 10)}.sqlite`,
        fileSize: 2500000,
        checksum: makeId("checksum"),
        status: "READY",
        createdBy: actorId,
        createdAt: nowIso(),
      };
      setState((state) => ({ ...state, backups: [backup, ...state.backups] }));
      return backup;
    }, 800),

  restoreBackup: (id: string) =>
    respondAfter(() => {
      const backup = getState().backups.find(
        (candidate) => candidate.id === id,
      );
      if (!backup) {
        throw new Error("Backup tidak ditemukan.");
      }
      return backup;
    }, 1000),
};
