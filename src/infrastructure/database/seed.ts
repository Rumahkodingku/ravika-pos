import "server-only";

import { and, eq } from "drizzle-orm";
import { hashPassword } from "@/modules/auth/password";
import { encryptQrToken } from "@/shared/crypto/qr-token";
import { hashToken } from "@/shared/ids";
import { permissionGroups, roleDefinitions } from "@/shared/permissions";
import {
  addOns,
  business,
  categories,
  diningTables,
  orderItemAddOns,
  orderItems,
  orderStatusHistory,
  orders,
  payments,
  permissions,
  productAddOns,
  products,
  productVariants,
  rolePermissions,
  roles,
  users,
} from "./schema";
import type { AppDatabase } from "./types";

type SeedMode = "development" | "production";

const DEMO_PASSWORD = "demo123";

function envOrDefault(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback;
}

async function ensureBusiness(db: AppDatabase, now: Date) {
  const existing = await db.select().from(business).limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const row = {
    id: "business-ravika",
    name: envOrDefault("RAVIKA_BUSINESS_NAME", "RAVIKA"),
    code: envOrDefault("RAVIKA_BUSINESS_CODE", "RVK"),
    address: envOrDefault("RAVIKA_BUSINESS_ADDRESS", "Jakarta Selatan"),
    phone: envOrDefault("RAVIKA_BUSINESS_PHONE", "021-000000"),
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(business).values(row);
  return row;
}

async function ensurePermissions(db: AppDatabase, now: Date) {
  for (const group of permissionGroups) {
    for (const permission of group.permissions) {
      await db
        .insert(permissions)
        .values({
          id: `permission-${permission.code}`,
          code: permission.code,
          label: permission.label,
          groupName: group.label,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: permissions.code,
          set: { label: permission.label, groupName: group.label },
        });
    }
  }

  const rows = await db.select().from(permissions);
  return new Map(rows.map((row) => [row.code, row.id]));
}

async function ensureRoles(
  db: AppDatabase,
  businessId: string,
  permissionIdByCode: Map<string, string>,
  now: Date,
) {
  const roleIdByCode = new Map<string, string>();

  for (const definition of roleDefinitions) {
    const existing = await db
      .select()
      .from(roles)
      .where(
        and(eq(roles.businessId, businessId), eq(roles.code, definition.code)),
      )
      .limit(1);

    let roleId = existing[0]?.id;

    if (!roleId) {
      roleId = `role-${definition.code.toLowerCase()}`;
      await db.insert(roles).values({
        id: roleId,
        businessId,
        name: definition.name,
        code: definition.code,
        description: definition.description,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    roleIdByCode.set(definition.code, roleId);

    const shouldSyncPermissions = !existing[0] || definition.code === "OWNER";

    if (shouldSyncPermissions) {
      for (const code of definition.permissionCodes) {
        const permissionId = permissionIdByCode.get(code);

        if (!permissionId) {
          continue;
        }

        await db
          .insert(rolePermissions)
          .values({ roleId, permissionId })
          .onConflictDoNothing();
      }
    }
  }

  return roleIdByCode;
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

async function activeOwnerCount(db: AppDatabase, ownerRoleId: string) {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.roleId, ownerRoleId), eq(users.isActive, true)));

  return rows.length;
}

export async function seedDatabase(db: AppDatabase, mode: SeedMode) {
  const productionEmail = process.env.RAVIKA_BOOTSTRAP_OWNER_EMAIL?.trim();
  const productionPassword = process.env.RAVIKA_BOOTSTRAP_OWNER_PASSWORD;

  if (mode === "production" && productionEmail && productionPassword) {
    // Env bootstrap remains a fallback. The first-run wizard can create the owner when these are absent.
  }

  const now = new Date();
  const businessRow = await ensureBusiness(db, now);
  const permissionIdByCode = await ensurePermissions(db, now);
  const roleIdByCode = await ensureRoles(
    db,
    businessRow.id,
    permissionIdByCode,
    now,
  );
  const ownerRoleId = roleIdByCode.get("OWNER");

  if (!ownerRoleId) {
    throw new Error("Role OWNER gagal dibuat.");
  }

  const ownerCount = await activeOwnerCount(db, ownerRoleId);

  if (ownerCount === 0) {
    if (mode === "production" && productionEmail && productionPassword) {
      await ensureUser(db, {
        id: "user-owner",
        businessId: businessRow.id,
        roleId: ownerRoleId,
        name: envOrDefault("RAVIKA_BOOTSTRAP_OWNER_NAME", "Pemilik"),
        email: productionEmail,
        username: "owner",
        password: productionPassword,
        now,
      });
    } else if (mode !== "production") {
      await ensureUser(db, {
        id: "user-owner",
        businessId: businessRow.id,
        roleId: ownerRoleId,
        name: "Rina Pemilik",
        email: "owner@ravika.id",
        username: "owner",
        password: DEMO_PASSWORD,
        now,
      });
    }
  }

  if (mode === "development") {
    const cashierRoleId = roleIdByCode.get("CASHIER");
    const baristaRoleId = roleIdByCode.get("BARISTA");

    if (cashierRoleId) {
      await ensureUser(db, {
        id: "user-cashier",
        businessId: businessRow.id,
        roleId: cashierRoleId,
        name: "Bagas Kasir",
        email: "cashier@ravika.id",
        username: "cashier",
        password: DEMO_PASSWORD,
        now,
      });
    }

    if (baristaRoleId) {
      await ensureUser(db, {
        id: "user-barista",
        businessId: businessRow.id,
        roleId: baristaRoleId,
        name: "Nadia Barista",
        email: "barista@ravika.id",
        username: "barista",
        password: DEMO_PASSWORD,
        now,
      });
    }

    await ensureDemoCatalog(db, businessRow.id, now);
    await ensureDemoTables(db, now);
    await ensureDemoOrders(db, businessRow.id, now);
  }
}

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
    basePrice: 22000,
    variant: {
      id: "variant-espresso-large",
      name: "Large",
      priceAdjustment: 5000,
    },
    addOnIds: ["addon-extra-shot", "addon-oat-milk"],
  },
  {
    id: "product-americano",
    name: "Americano",
    categoryId: "category-kopi",
    basePrice: 25000,
    variant: {
      id: "variant-americano-large",
      name: "Large",
      priceAdjustment: 5000,
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
        priceAdjustment: product.variant.priceAdjustment,
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
        product.basePrice +
        (product.variant?.priceAdjustment ?? 0) +
        addOnTotal;

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
      createdBy: index % 3 === 0 ? null : "user-cashier",
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
          changedBy: "user-cashier",
          reason: "",
          createdAt: created,
        },
        {
          id: `history-${orderId}-cancelled`,
          orderId,
          previousStatus: "NEW",
          newStatus: "CANCELLED",
          changedBy: "user-owner",
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
          changedBy: step === 0 ? "user-cashier" : "user-barista",
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
        recordedBy: "user-cashier",
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
