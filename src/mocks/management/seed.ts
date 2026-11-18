import {
  baristaPermissionCodes,
  cashierPermissionCodes,
  ownerPermissionCodes,
} from "@/mocks/permissions";
import { mockUsers } from "@/mocks/session";
import type {
  AddOn,
  BackupRecord,
  Business,
  Category,
  DiningTable,
  License,
  ManagementUser,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  PaymentMethod,
  Product,
  Role,
} from "@/types/domain";

const createdAt = "2026-11-15T08:00:00+07:00";
const updatedAt = "2026-11-16T09:00:00+07:00";

export const seedBusiness: Business = {
  id: "business-ravika",
  name: "RAVIKA",
  code: "RVK",
  address: "Jakarta Selatan",
  phone: "021-000000",
  createdAt,
  updatedAt,
};

const categoryNames = ["Kopi", "Non-kopi", "Makanan", "Snack", "Manual Brew"];

const seedCategories: Category[] = categoryNames.map((name, index) => ({
  id: `category-${index + 1}`,
  businessId: seedBusiness.id,
  name,
  description: `Kategori ${name.toLowerCase()}`,
  sortOrder: index + 1,
  isActive: true,
  createdAt,
  updatedAt,
}));

const seedAddOns: AddOn[] = [
  {
    id: "addon-extra-shot",
    businessId: seedBusiness.id,
    name: "Extra shot",
    price: 6000,
    isActive: true,
  },
  {
    id: "addon-oat-milk",
    businessId: seedBusiness.id,
    name: "Oat milk",
    price: 8000,
    isActive: true,
  },
  {
    id: "addon-butter",
    businessId: seedBusiness.id,
    name: "Extra butter",
    price: 5000,
    isActive: true,
  },
  {
    id: "addon-cheese",
    businessId: seedBusiness.id,
    name: "Extra cheese",
    price: 7000,
    isActive: true,
  },
];

const productSeed = [
  ["Espresso", "Kopi", 22000, true],
  ["Kopi Susu", "Kopi", 28000, true],
  ["Matcha Latte", "Non-kopi", 32000, true],
  ["Croissant Butter", "Snack", 26000, true],
  ["Chicken Sandwich", "Makanan", 38000, true],
  ["Es Teh Lemon", "Non-kopi", 18000, false],
  ["Cappuccino", "Kopi", 30000, true],
  ["Americano", "Kopi", 24000, true],
  ["Chocolate", "Non-kopi", 30000, true],
  ["French Fries", "Snack", 24000, true],
  ["Beef Rice Bowl", "Makanan", 48000, true],
  ["V60 Manual Brew", "Manual Brew", 36000, true],
] as const;

const seedProducts: Product[] = productSeed.map(
  ([name, categoryName, basePrice, isAvailable], index) => {
    const category = seedCategories.find(
      (candidate) => candidate.name === categoryName,
    );
    const hasVariants = index === 1 || index === 6;
    const hasAddOns = index === 0 || index === 1 || index === 2;

    return {
      id: `product-${index + 1}`,
      businessId: seedBusiness.id,
      categoryId: category?.id ?? seedCategories[0].id,
      name,
      description: `Contoh produk ${name.toLowerCase()}`,
      basePrice,
      isAvailable,
      isActive: true,
      variants: hasVariants
        ? [
            {
              id: `variant-${index + 1}-regular`,
              name: "Regular",
              priceAdjustment: 0,
              isActive: true,
            },
            {
              id: `variant-${index + 1}-large`,
              name: "Large",
              priceAdjustment: 6000,
              isActive: true,
            },
          ]
        : [],
      addOns: hasAddOns
        ? seedAddOns.slice(0, 2).map((addOn) => ({
            addOnId: addOn.id,
            isRequired: false,
            minSelection: 0,
            maxSelection: 2,
          }))
        : [],
      createdAt,
      updatedAt,
    };
  },
);

const seedTables: DiningTable[] = [
  ["Meja 01", "AVAILABLE"],
  ["Meja 02", "OCCUPIED"],
  ["Meja 03", "AVAILABLE"],
  ["Meja 04", "INACTIVE"],
].map(([name, status], index) => ({
  id: `table-${index + 1}`,
  name: name as string,
  status: status as DiningTable["status"],
  qrToken: `tbl-${(index + 1).toString(36)}-${(((index + 1) * 2654435761) >>> 0).toString(36)}`,
  isActive: status !== "INACTIVE",
  createdAt,
  updatedAt,
}));

const seedUsers: ManagementUser[] = [
  ...mockUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: user.roleLabel,
    isActive: true,
    createdAt,
    updatedAt,
  })),
  {
    id: "user-cashier-2",
    name: "Andi Kasir",
    email: "andi@ravika.id",
    role: "CASHIER",
    roleLabel: "Kasir",
    isActive: true,
    createdAt,
    updatedAt,
  },
  {
    id: "user-barista-2",
    name: "Sari Barista",
    email: "sari@ravika.id",
    role: "BARISTA",
    roleLabel: "Barista",
    isActive: true,
    createdAt,
    updatedAt,
  },
];

const seedRoles: Role[] = [
  {
    id: "role-owner",
    name: "Pemilik",
    code: "OWNER",
    description: "Akses penuh ke pengelolaan bisnis.",
    isSystem: true,
    permissionCodes: ownerPermissionCodes,
  },
  {
    id: "role-cashier",
    name: "Kasir",
    code: "CASHIER",
    description: "Membuat pesanan dan mencatat pembayaran.",
    isSystem: true,
    permissionCodes: cashierPermissionCodes,
  },
  {
    id: "role-barista",
    name: "Barista",
    code: "BARISTA",
    description: "Memproses pesanan melalui KDS.",
    isSystem: true,
    permissionCodes: baristaPermissionCodes,
  },
];

const paymentMethods: PaymentMethod[] = [
  "CASH",
  "QRIS",
  "TRANSFER",
  "E_WALLET",
];

function addMinutes(iso: string, minutes: number) {
  const date = new Date(iso);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function makeItems(orderIndex: number, productIndexes: number[]): OrderItem[] {
  return productIndexes.map((productIndex, itemIndex) => {
    const product = seedProducts[productIndex % seedProducts.length];
    const quantity = ((orderIndex + itemIndex) % 2) + 1;
    const variant =
      product.variants.length > 0
        ? product.variants[(orderIndex + itemIndex) % product.variants.length]
        : null;
    const addOn =
      product.addOns.length > 0
        ? seedAddOns.find(
            (candidate) => candidate.id === product.addOns[0].addOnId,
          )
        : null;
    const unitPrice =
      product.basePrice + (variant?.priceAdjustment ?? 0) + (addOn?.price ?? 0);

    return {
      id: `order-item-${orderIndex + 1}-${itemIndex + 1}`,
      productId: product.id,
      productName: product.name,
      variantName: variant?.name ?? null,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      notes: itemIndex === 0 && orderIndex % 4 === 0 ? "Less sugar" : "",
      addOns: addOn
        ? [
            {
              id: `order-addon-${orderIndex + 1}-${itemIndex + 1}`,
              addOnId: addOn.id,
              name: addOn.name,
              price: addOn.price,
              quantity: 1,
            },
          ]
        : [],
    };
  });
}

const orderStatuses: Order["orderStatus"][] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const paymentStatuses: Order["paymentStatus"][] = [
  "PAID",
  "PAID",
  "PARTIALLY_PAID",
  "PAID",
  "UNPAID",
  "REFUNDED",
];

const seedOrders: Order[] = Array.from({ length: 24 }, (_, index) => {
  const orderStatus = orderStatuses[index % orderStatuses.length];
  const paymentStatus = paymentStatuses[index % paymentStatuses.length];
  const items = makeItems(index, [
    index % seedProducts.length,
    (index + 3) % seedProducts.length,
  ]);
  const grandTotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const dayOffset = index % 7;
  const orderDate = new Date("2026-11-16T10:42:00+07:00");
  orderDate.setDate(orderDate.getDate() - dayOffset);
  orderDate.setMinutes(orderDate.getMinutes() - (index % 6) * 8);
  const orderType = index % 3 === 0 ? "TAKEAWAY" : "DINE_IN";
  const source = index % 4 === 0 ? "QR" : "CASHIER";
  const table =
    orderType === "DINE_IN" && seedTables.length > 0
      ? seedTables[index % seedTables.length]
      : null;

  return {
    id: `order-${index + 1}`,
    businessId: seedBusiness.id,
    orderNumber: `RVK-${String(2000 + index + 1)}`,
    orderType,
    source,
    tableId: table?.id ?? null,
    orderStatus,
    paymentStatus,
    publicToken:
      source === "QR"
        ? `pub-rvk-${(index + 1).toString(36)}-${(((index + 1) * 2654435761) >>> 0).toString(36)}`
        : null,
    subtotal: grandTotal,
    grandTotal,
    notes: index % 5 === 0 ? "Sajikan bersama." : "",
    createdBy:
      source === "QR"
        ? null
        : orderType === "DINE_IN"
          ? "user-cashier"
          : "user-cashier-2",
    createdAt: orderDate.toISOString(),
    updatedAt: addMinutes(orderDate.toISOString(), 8),
    items,
  };
});

const activeOrderStatuses = new Set<Order["orderStatus"]>([
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
]);

// Keep KDS timers plausible without changing the fixed demo date.
const seedNow = Date.now();
seedOrders.forEach((order, index) => {
  if (!activeOrderStatuses.has(order.orderStatus)) {
    return;
  }
  const iso = new Date(seedNow - (10 + (index % 6)) * 60_000).toISOString();
  order.createdAt = iso;
  order.updatedAt = iso;
});

const activeTableIds = new Set(
  seedOrders
    .filter((order) => activeOrderStatuses.has(order.orderStatus))
    .map((order) => order.tableId)
    .filter((tableId): tableId is string => tableId !== null),
);

for (const table of seedTables) {
  if (table.status === "INACTIVE") {
    continue;
  }
  table.status = activeTableIds.has(table.id) ? "OCCUPIED" : "AVAILABLE";
}

const seedPayments: Payment[] = [];
seedOrders.forEach((order, index) => {
  if (order.paymentStatus === "UNPAID") {
    return;
  }

  const method = paymentMethods[index % paymentMethods.length];
  const recordedBy = index % 2 === 0 ? "user-owner" : "user-cashier";

  if (order.paymentStatus === "PAID") {
    const firstAmount = Math.round(order.grandTotal * 0.6);
    const firstId = seedPayments.length + 1;
    const secondId = seedPayments.length + 2;
    seedPayments.push(
      {
        id: `payment-${firstId}`,
        orderId: order.id,
        method,
        amount: firstAmount,
        status: "RECORDED",
        reference: `REF-${order.orderNumber}-A`,
        notes: "Pembayaran pertama.",
        recordedBy,
        paidAt: addMinutes(order.createdAt, 3),
        createdAt: addMinutes(order.createdAt, 3),
      },
      {
        id: `payment-${secondId}`,
        orderId: order.id,
        method: paymentMethods[(index + 1) % paymentMethods.length],
        amount: order.grandTotal - firstAmount,
        status: "RECORDED",
        reference: `REF-${order.orderNumber}-B`,
        notes: "Pelunasan.",
        recordedBy,
        paidAt: addMinutes(order.createdAt, 6),
        createdAt: addMinutes(order.createdAt, 6),
      },
    );
    return;
  }

  const amount =
    order.paymentStatus === "PARTIALLY_PAID"
      ? Math.round(order.grandTotal / 2)
      : order.grandTotal;

  seedPayments.push({
    id: `payment-${seedPayments.length + 1}`,
    orderId: order.id,
    method,
    amount,
    status: order.paymentStatus === "REFUNDED" ? "REFUNDED" : "RECORDED",
    reference: `REF-${order.orderNumber}`,
    notes: order.paymentStatus === "REFUNDED" ? "Dana dikembalikan." : "",
    recordedBy,
    paidAt: addMinutes(order.createdAt, 4),
    createdAt: addMinutes(order.createdAt, 4),
  });
});

const seedStatusHistory: OrderStatusHistory[] = seedOrders.flatMap(
  (order, index) => {
    const history: OrderStatusHistory[] = [
      {
        id: `history-${index + 1}-new`,
        orderId: order.id,
        previousStatus: null,
        newStatus: "NEW",
        changedBy: order.createdBy,
        reason: "",
        createdAt: order.createdAt,
      },
    ];

    if (order.orderStatus !== "NEW") {
      history.push({
        id: `history-${index + 1}-current`,
        orderId: order.id,
        previousStatus: "NEW",
        newStatus: order.orderStatus,
        changedBy: "user-barista",
        reason: order.orderStatus === "CANCELLED" ? "Stok tidak tersedia." : "",
        createdAt: order.updatedAt,
      });
    }

    return history;
  },
);

export const seedLicense: License = {
  id: "license-1",
  businessIdentifier: "RAVIKA",
  installationId: "RAV-KMG-2026-001",
  issuedAt: "2026-01-01T00:00:00+07:00",
  expiresAt: "2027-01-01T00:00:00+07:00",
  status: "VALID",
  publicKeyFingerprint: "DEMO-PUBLIC-KEY-8F3A",
};

export const seedBackups: BackupRecord[] = [
  {
    id: "backup-1",
    fileName: "ravika-2026-11-16.sqlite",
    filePath: "/backup/ravika-2026-11-16.sqlite",
    fileSize: 2457600,
    checksum: "demo-checksum-1",
    status: "READY",
    createdBy: "user-owner",
    createdAt: "2026-11-16T08:00:00+07:00",
  },
  {
    id: "backup-2",
    fileName: "ravika-2026-11-15.sqlite",
    filePath: "/backup/ravika-2026-11-15.sqlite",
    fileSize: 2396160,
    checksum: "demo-checksum-2",
    status: "READY",
    createdBy: "user-owner",
    createdAt: "2026-11-15T08:00:00+07:00",
  },
  {
    id: "backup-3",
    fileName: "ravika-2026-11-14.sqlite",
    filePath: "/backup/ravika-2026-11-14.sqlite",
    fileSize: 2314240,
    checksum: "demo-checksum-3",
    status: "READY",
    createdBy: "user-owner",
    createdAt: "2026-11-14T08:00:00+07:00",
  },
];

export function createInitialState() {
  return {
    business: { ...seedBusiness },
    categories: seedCategories.map((category) => ({ ...category })),
    addOns: seedAddOns.map((addOn) => ({ ...addOn })),
    products: seedProducts.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({ ...variant })),
      addOns: product.addOns.map((addOn) => ({ ...addOn })),
    })),
    tables: seedTables.map((table) => ({ ...table })),
    users: seedUsers.map((user) => ({
      ...user,
    })),
    roles: seedRoles.map((role) => ({
      ...role,
      permissionCodes: [...role.permissionCodes],
    })),
    orders: seedOrders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        addOns: item.addOns.map((addOn) => ({ ...addOn })),
      })),
    })),
    payments: seedPayments.map((payment) => ({ ...payment })),
    statusHistory: seedStatusHistory.map((history) => ({ ...history })),
    license: { ...seedLicense },
    backups: seedBackups.map((backup) => ({ ...backup })),
  };
}
