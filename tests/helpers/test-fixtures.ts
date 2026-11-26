import { eq } from "drizzle-orm";
import type { DatabaseBundle } from "@/infrastructure/database/client";
import {
  addOns,
  categories,
  diningTables,
  orderItemAddOns,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  productAddOns,
  products,
  productVariants,
  roles,
  users,
} from "@/infrastructure/database/schema";
import { seedDatabase } from "@/infrastructure/database/seed";
import type { AppDatabase } from "@/infrastructure/database/types";
import { hashPassword } from "@/modules/auth/password";
import { encryptQrToken } from "@/shared/crypto/qr-token";
import { hashToken } from "@/shared/ids";

const DEMO_PASSWORD = "demo123";

const demoCategories = [
  { id: "category-kopi", name: "Kopi", sortOrder: 0 },
  { id: "category-non-kopi", name: "Non-Kopi", sortOrder: 1 },
  { id: "category-teh", name: "Teh", sortOrder: 2 },
  { id: "category-makanan", name: "Makanan", sortOrder: 3 },
  { id: "category-dessert", name: "Dessert", sortOrder: 4 },
];

const demoAddOns = [
  { id: "addon-extra-shot", name: "Extra Shot", price: 5000 },
  { id: "addon-oat-milk", name: "Oat Milk", price: 8000 },
  { id: "addon-boba", name: "Boba", price: 6000 },
  { id: "addon-extra-cheese", name: "Extra Cheese", price: 7000 },
];

const demoProducts = [
  {
    id: "product-espresso",
    name: "Espresso",
    categoryId: "category-kopi",
    basePrice: null,
    variant: {
      id: "variant-espresso-large",
      name: "Large",
      price: 27000,
    },
    addOnIds: ["addon-extra-shot", "addon-oat-milk"],
  },
  {
    id: "product-americano",
    name: "Americano",
    categoryId: "category-kopi",
    basePrice: null,
    variant: {
      id: "variant-americano-large",
      name: "Large",
      price: 30000,
    },
    addOnIds: ["addon-extra-shot", "addon-oat-milk"],
  },
  {
    id: "product-kopi-susu",
    name: "Kopi Susu",
    categoryId: "category-kopi",
    basePrice: 28000,
    addOnIds: ["addon-extra-shot", "addon-oat-milk"],
  },
  {
    id: "product-matcha-latte",
    name: "Matcha Latte",
    categoryId: "category-non-kopi",
    basePrice: 32000,
    addOnIds: ["addon-oat-milk"],
  },
  {
    id: "product-chocolate",
    name: "Chocolate",
    categoryId: "category-non-kopi",
    basePrice: 30000,
    addOnIds: ["addon-oat-milk"],
  },
  {
    id: "product-lemon-tea",
    name: "Lemon Tea",
    categoryId: "category-teh",
    basePrice: 24000,
    addOnIds: ["addon-boba"],
  },
  {
    id: "product-milk-tea",
    name: "Milk Tea",
    categoryId: "category-teh",
    basePrice: 27000,
    addOnIds: ["addon-boba"],
  },
  {
    id: "product-croissant",
    name: "Croissant",
    categoryId: "category-makanan",
    basePrice: 28000,
    addOnIds: [],
  },
  {
    id: "product-banana-bread",
    name: "Banana Bread",
    categoryId: "category-makanan",
    basePrice: 26000,
    addOnIds: [],
  },
  {
    id: "product-nasi-goreng",
    name: "Nasi Goreng",
    categoryId: "category-makanan",
    basePrice: 38000,
    addOnIds: [],
  },
  {
    id: "product-cheesecake",
    name: "Cheesecake",
    categoryId: "category-dessert",
    basePrice: 35000,
    addOnIds: ["addon-extra-cheese"],
  },
  {
    id: "product-brownies",
    name: "Brownies",
    categoryId: "category-dessert",
    basePrice: 30000,
    addOnIds: [],
  },
];

async function ensureDemoCatalog(
  db: AppDatabase,
  businessId: string,
  now: Date,
) {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.businessId, businessId))
    .limit(1);

  if (existing[0]) {
    return;
  }

  for (const category of demoCategories) {
    await db.insert(categories).values({
      id: category.id,
      businessId,
      name: category.name,
      description: "",
      sortOrder: category.sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const addOn of demoAddOns) {
    await db.insert(addOns).values({
      id: addOn.id,
      businessId,
      name: addOn.name,
      price: addOn.price,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const product of demoProducts) {
    await db.insert(products).values({
      id: product.id,
      businessId,
      categoryId: product.categoryId,
      name: product.name,
      description: "",
      basePrice: product.basePrice,
      isAvailable: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    if (product.variant) {
      await db.insert(productVariants).values({
        id: product.variant.id,
        productId: product.id,
        name: product.variant.name,
        price: product.variant.price,
        isActive: true,
      });
    }

    for (const addOnId of product.addOnIds) {
      await db.insert(productAddOns).values({
        productId: product.id,
        addOnId,
        isRequired: false,
        minSelection: 0,
        maxSelection: 2,
      });
    }
  }
}

async function ensureDemoTables(db: AppDatabase, now: Date) {
  const existing = await db
    .select({ id: diningTables.id })
    .from(diningTables)
    .limit(1);

  if (existing[0]) {
    return;
  }

  for (let index = 1; index <= 4; index += 1) {
    const id = `table-${index}`;
    const token = `demo-qr-token-table-${index}`;

    await db.insert(diningTables).values({
      id,
      name: `Meja 0${index}`,
      status: "AVAILABLE",
      qrTokenHash: hashToken(token),
      qrTokenCiphertext: encryptQrToken(id, token),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}

async function ensureDemoOrders(
  db: AppDatabase,
  businessId: string,
  roleIds: {
    kitchenRoleId: string | null;
    cashierRoleId: string | null;
    ownerRoleId: string | null;
  },
  now: Date,
) {
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.businessId, businessId))
    .limit(1);

  if (existing[0]) {
    return;
  }

  const addOnById = new Map(demoAddOns.map((addOn) => [addOn.id, addOn]));
  const businessUsers = await db
    .select()
    .from(users)
    .where(eq(users.businessId, businessId));
  const userByRole = (roleId: string | null) =>
    roleId
      ? (businessUsers.find((user) => user.roleId === roleId)?.id ?? null)
      : null;
  const cashierUserId = userByRole(roleIds.cashierRoleId);
  const ownerUserId = userByRole(roleIds.ownerRoleId);
  const kitchenUserId =
    userByRole(roleIds.kitchenRoleId) ?? cashierUserId ?? ownerUserId;
  const occupied = new Set<string>();

  for (let index = 0; index < 24; index += 1) {
    const orderId = `order-demo-${index + 1}`;
    const created = new Date(now);
    const dayOffset = index < 18 ? 6 - Math.floor(index / 3) : 0;

    created.setDate(created.getDate() - dayOffset);
    created.setHours(9 + (index % 8), (index * 7) % 60, 0, 0);

    const orderStatus =
      index < 18
        ? "COMPLETED"
        : (["NEW", "ACCEPTED", "PREPARING", "READY", "CANCELLED", "COMPLETED"][
            index - 18
          ] as
            | "NEW"
            | "ACCEPTED"
            | "PREPARING"
            | "READY"
            | "CANCELLED"
            | "COMPLETED");
    const orderType = index % 4 === 0 ? "TAKEAWAY" : "DINE_IN";
    const tableId = orderType === "DINE_IN" ? `table-${(index % 4) + 1}` : null;
    const selected = [
      demoProducts[index % demoProducts.length],
      demoProducts[(index + 5) % demoProducts.length],
    ];
    const lineItems = selected.map((product, itemIndex) => {
      const quantity = 1 + ((index + itemIndex) % 3);
      const addOn =
        itemIndex === 0 && product.addOnIds.length > 0 && index % 3 === 0
          ? addOnById.get(product.addOnIds[0])
          : null;
      const addOnTotal = addOn?.price ?? 0;
      const unitPrice =
        (product.variant?.price ?? product.basePrice ?? 0) + addOnTotal;

      return {
        id: `order-item-${index + 1}-${itemIndex + 1}`,
        product,
        quantity,
        unitPrice,
        addOnTotal,
        addOn,
        lineTotal: unitPrice * quantity,
      };
    });
    const subtotal = lineItems.reduce(
      (total, item) => total + item.lineTotal,
      0,
    );
    const plan = index % 5;
    const paymentAmounts =
      orderStatus === "CANCELLED" || plan === 0
        ? []
        : plan === 1
          ? [Math.floor(subtotal / 2)]
          : plan === 2
            ? [Math.floor(subtotal / 2), subtotal - Math.floor(subtotal / 2)]
            : [subtotal];
    const paidTotal = paymentAmounts.reduce(
      (total, amount) => total + amount,
      0,
    );
    const paymentStatus =
      paidTotal === 0
        ? "UNPAID"
        : paidTotal >= subtotal
          ? "PAID"
          : "PARTIALLY_PAID";

    await db.insert(orders).values({
      id: orderId,
      businessId,
      orderNumber: `RVK-${2001 + index}`,
      orderType,
      source: index % 3 === 0 ? "QR" : "CASHIER",
      tableId,
      orderStatus,
      paymentStatus,
      publicToken: index % 3 === 0 ? `public-demo-${index + 1}` : null,
      subtotal,
      discountTotal: 0,
      grandTotal: subtotal,
      notes: "",
      createdBy: index % 3 === 0 ? null : cashierUserId,
      createdAt: created,
      updatedAt: created,
    });

    for (const item of lineItems) {
      await db.insert(orderItems).values({
        id: item.id,
        orderId,
        productId: item.product.id,
        productNameSnapshot: item.product.name,
        variantNameSnapshot: item.product.variant?.name ?? null,
        quantity: item.quantity,
        unitPriceSnapshot: item.unitPrice - item.addOnTotal,
        addOnTotalSnapshot: item.addOnTotal,
        lineTotal: item.lineTotal,
        notes: "",
      });

      if (item.addOn) {
        await db.insert(orderItemAddOns).values({
          id: `order-item-addon-${item.id}`,
          orderItemId: item.id,
          addOnId: item.addOn.id,
          addOnNameSnapshot: item.addOn.name,
          priceSnapshot: item.addOn.price,
          quantity: 1,
        });
      }
    }

    const flow = [
      "NEW",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "COMPLETED",
    ] as const;

    if (orderStatus === "CANCELLED") {
      await db.insert(orderStatusHistory).values([
        {
          id: `history-${orderId}-new`,
          orderId,
          previousStatus: null,
          newStatus: "NEW",
          changedBy: cashierUserId,
          reason: "",
          createdAt: created,
        },
        {
          id: `history-${orderId}-cancelled`,
          orderId,
          previousStatus: "NEW",
          newStatus: "CANCELLED",
          changedBy: ownerUserId,
          reason: "Pesanan demo dibatalkan.",
          createdAt: created,
        },
      ]);
    } else {
      const lastIndex = flow.indexOf(orderStatus as (typeof flow)[number]);

      for (let step = 0; step <= lastIndex; step += 1) {
        await db.insert(orderStatusHistory).values({
          id: `history-${orderId}-${step}`,
          orderId,
          previousStatus: step === 0 ? null : flow[step - 1],
          newStatus: flow[step],
          changedBy: step === 0 ? cashierUserId : kitchenUserId,
          reason: "",
          createdAt: new Date(created.getTime() + step * 60_000),
        });
      }
    }

    for (const [paymentIndex, amount] of paymentAmounts.entries()) {
      const paidAt = new Date(created.getTime() + 10 * 60_000 + paymentIndex);

      await db.insert(payments).values({
        id: `payment-demo-${index + 1}-${paymentIndex + 1}`,
        orderId,
        method: paymentIndex === 1 ? "QRIS" : "CASH",
        amount,
        status: "RECORDED",
        reference: "",
        notes: "",
        recordedBy: cashierUserId ?? "user-cashier",
        paidAt,
        createdAt: paidAt,
      });
    }

    if (
      tableId &&
      ["NEW", "ACCEPTED", "PREPARING", "READY"].includes(orderStatus)
    ) {
      occupied.add(tableId);
    }
  }

  for (const tableId of occupied) {
    await db
      .update(diningTables)
      .set({ status: "OCCUPIED", updatedAt: now })
      .where(eq(diningTables.id, tableId));
  }
}

async function ensureUser(
  db: AppDatabase,
  input: {
    id: string;
    businessId: string;
    roleId: string;
    name: string;
    email: string;
    username: string;
    password: string;
    now: Date;
  },
) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return;
  }

  await db.insert(users).values({
    id: input.id,
    businessId: input.businessId,
    roleId: input.roleId,
    name: input.name,
    email: input.email.toLowerCase(),
    username: input.username.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    isActive: true,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

export async function seedTestDatabase(bundle: DatabaseBundle) {
  process.env.RAVIKA_BOOTSTRAP_OWNER_NAME = "Rina Pemilik";
  process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL = "owner@ravika.id";
  process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD = "demo123";

  await seedDatabase(bundle.db, "production");

  const businessId = "business-ravika";
  const now = new Date();
  const roleRows = await bundle.db
    .select()
    .from(roles)
    .where(eq(roles.businessId, businessId));
  const roleIdByCode = new Map(roleRows.map((role) => [role.code, role.id]));
  const ownerRoleId = roleIdByCode.get("OWNER");
  const cashierRoleId = roleIdByCode.get("CASHIER");
  const kitchenRoleId = roleIdByCode.get("KITCHEN");

  if (cashierRoleId) {
    await ensureUser(bundle.db, {
      id: "user-cashier",
      businessId,
      roleId: cashierRoleId,
      name: "Bagas Kasir",
      email: "cashier@ravika.id",
      username: "cashier",
      password: DEMO_PASSWORD,
      now,
    });
  }

  if (kitchenRoleId) {
    await ensureUser(bundle.db, {
      id: "user-kitchen",
      businessId,
      roleId: kitchenRoleId,
      name: "Nadia Kitchen",
      email: "kitchen@ravika.id",
      username: "kitchen",
      password: DEMO_PASSWORD,
      now,
    });
  }

  await ensureDemoCatalog(bundle.db, businessId, now);
  await ensureDemoTables(bundle.db, now);
  await ensureDemoOrders(
    bundle.db,
    businessId,
    {
      kitchenRoleId: kitchenRoleId ?? null,
      cashierRoleId: cashierRoleId ?? null,
      ownerRoleId: ownerRoleId ?? null,
    },
    now,
  );
}
