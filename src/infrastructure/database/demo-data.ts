import "server-only";

import { eq } from "drizzle-orm";
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
import type { AppDatabase } from "@/infrastructure/database/types";
import { hashPassword } from "@/modules/auth/password";
import { saveProductImage } from "@/modules/catalog/product-image.service";
import { encryptQrToken } from "@/shared/crypto/qr-token";
import { hashToken } from "@/shared/ids";

const DEMO_PASSWORD = "demo123";

const demoCategories = [
  { id: "category-kopi", name: "Kopi", sortOrder: 0 },
  { id: "category-non-kopi", name: "Non-Kopi", sortOrder: 1 },
  { id: "category-teh", name: "Teh", sortOrder: 2 },
  { id: "category-makanan", name: "Makanan", sortOrder: 3 },
  { id: "category-dessert", name: "Dessert", sortOrder: 4 },
  { id: "category-snack", name: "Snack", sortOrder: 5 },
  { id: "category-roti", name: "Roti", sortOrder: 6 },
  { id: "category-paket", name: "Paket", sortOrder: 7 },
  { id: "category-minuman-dingin", name: "Minuman Dingin", sortOrder: 8 },
  { id: "category-seasonal", name: "Seasonal", sortOrder: 9 },
];

const demoAddOns = [
  { id: "addon-extra-shot", name: "Extra Shot", price: 5000 },
  { id: "addon-oat-milk", name: "Oat Milk", price: 8000 },
  { id: "addon-boba", name: "Boba", price: 6000 },
  { id: "addon-extra-cheese", name: "Extra Cheese", price: 7000 },
  { id: "addon-whipped-cream", name: "Whipped Cream", price: 6000 },
  { id: "addon-vanilla-syrup", name: "Vanilla Syrup", price: 4000 },
  { id: "addon-caramel-syrup", name: "Caramel Syrup", price: 4000 },
  { id: "addon-ice-cream", name: "Ice Cream", price: 8000 },
  { id: "addon-sambal", name: "Sambal", price: 3000 },
  { id: "addon-telur", name: "Telur", price: 5000 },
  { id: "addon-keju", name: "Keju", price: 7000 },
  { id: "addon-cokelat", name: "Cokelat", price: 5000 },
  { id: "addon-matcha-powder", name: "Matcha Powder", price: 6000 },
  { id: "addon-gula-aren", name: "Gula Aren", price: 3000 },
  { id: "addon-susu-kental", name: "Susu Kental", price: 4000 },
];

type DemoProduct = {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  variant?: { id: string; name: string; priceAdjustment: number };
  addOnIds: string[];
};

const baseProducts: DemoProduct[] = [
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
    addOnIds: ["addon-extra-shot", "addon-oat-milk", "addon-gula-aren"],
  },
  {
    id: "product-matcha-latte",
    name: "Matcha Latte",
    categoryId: "category-non-kopi",
    basePrice: 32000,
    addOnIds: ["addon-oat-milk", "addon-matcha-powder"],
  },
  {
    id: "product-chocolate",
    name: "Chocolate",
    categoryId: "category-non-kopi",
    basePrice: 30000,
    addOnIds: ["addon-oat-milk", "addon-whipped-cream"],
  },
  {
    id: "product-lemon-tea",
    name: "Lemon Tea",
    categoryId: "category-teh",
    basePrice: 24000,
    addOnIds: ["addon-boba", "addon-caramel-syrup"],
  },
  {
    id: "product-milk-tea",
    name: "Milk Tea",
    categoryId: "category-teh",
    basePrice: 27000,
    addOnIds: ["addon-boba", "addon-vanilla-syrup"],
  },
  {
    id: "product-croissant",
    name: "Croissant",
    categoryId: "category-makanan",
    basePrice: 28000,
    addOnIds: ["addon-extra-cheese"],
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
    addOnIds: ["addon-sambal", "addon-telur"],
  },
  {
    id: "product-cheesecake",
    name: "Cheesecake",
    categoryId: "category-dessert",
    basePrice: 35000,
    addOnIds: ["addon-extra-cheese", "addon-cokelat"],
  },
  {
    id: "product-brownies",
    name: "Brownies",
    categoryId: "category-dessert",
    basePrice: 30000,
    addOnIds: ["addon-ice-cream"],
  },
];

const generatedProducts: DemoProduct[] = Array.from(
  { length: 28 },
  (_, index) => {
    const number = index + 13;
    const category = demoCategories[index % demoCategories.length];
    const price = 15000 + (index % 7) * 4000;

    return {
      addOnIds:
        index % 2 === 0 ? [demoAddOns[index % demoAddOns.length].id] : [],
      basePrice: price,
      categoryId: category.id,
      id: `product-demo-${number}`,
      name: `${category.name} Demo ${number}`,
    };
  },
);

const demoProducts: DemoProduct[] = [...baseProducts, ...generatedProducts];

async function ensureDemoUsers(db: AppDatabase, businessId: string, now: Date) {
  const roleRows = await db
    .select()
    .from(roles)
    .where(eq(roles.businessId, businessId));
  const roleIdByCode = new Map(roleRows.map((row) => [row.code, row.id]));
  const cashierRoleId = roleIdByCode.get("CASHIER");
  const kitchenRoleId = roleIdByCode.get("KITCHEN");

  if (cashierRoleId) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "cashier@ravika.id"))
      .limit(1);

    if (!existing[0]) {
      await db.insert(users).values({
        id: "user-cashier",
        businessId,
        roleId: cashierRoleId,
        name: "Bagas Kasir",
        email: "cashier@ravika.id",
        username: "cashier",
        passwordHash: await hashPassword(DEMO_PASSWORD),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (kitchenRoleId) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "kitchen@ravika.id"))
      .limit(1);

    if (!existing[0]) {
      await db.insert(users).values({
        id: "user-kitchen",
        businessId,
        roleId: kitchenRoleId,
        name: "Nadia Kitchen",
        email: "kitchen@ravika.id",
        username: "kitchen",
        passwordHash: await hashPassword(DEMO_PASSWORD),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

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

  for (let index = 1; index <= 12; index += 1) {
    const id = `table-${index}`;
    const token = `demo-qr-token-table-${index}`;

    await db.insert(diningTables).values({
      id,
      name: `Meja ${String(index).padStart(2, "0")}`,
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

  const roleRows = await db
    .select()
    .from(roles)
    .where(eq(roles.businessId, businessId));
  const roleIdByCode = new Map(roleRows.map((row) => [row.code, row.id]));
  const cashierRoleId = roleIdByCode.get("CASHIER");
  const kitchenRoleId = roleIdByCode.get("KITCHEN");
  const ownerRoleId = roleIdByCode.get("OWNER");
  const businessUsers = await db
    .select()
    .from(users)
    .where(eq(users.businessId, businessId));
  const userByRole = (roleId: string | null) =>
    roleId
      ? (businessUsers.find((user) => user.roleId === roleId)?.id ?? null)
      : null;
  const cashierUserId = userByRole(cashierRoleId ?? null);
  const ownerUserId = userByRole(ownerRoleId ?? null);
  const kitchenUserId =
    userByRole(kitchenRoleId ?? null) ?? cashierUserId ?? ownerUserId;
  const occupied = new Set<string>();

  const addOnById = new Map(demoAddOns.map((addOn) => [addOn.id, addOn]));

  for (let index = 0; index < 100; index += 1) {
    const orderId = `order-demo-${index + 1}`;
    const created = new Date(now);
    const dayOffset = index < 80 ? 6 - Math.floor(index / 13) : 0;

    created.setDate(created.getDate() - dayOffset);
    created.setHours(9 + (index % 9), (index * 7) % 60, 0, 0);

    const orderStatus =
      index < 80
        ? "COMPLETED"
        : (["NEW", "ACCEPTED", "PREPARING", "READY", "CANCELLED", "COMPLETED"][
            index - 80
          ] as
            | "NEW"
            | "ACCEPTED"
            | "PREPARING"
            | "READY"
            | "CANCELLED"
            | "COMPLETED");

    const orderType = index % 4 === 0 ? "TAKEAWAY" : "DINE_IN";
    const tableId =
      orderType === "DINE_IN" ? `table-${(index % 12) + 1}` : null;
    const selected = [
      demoProducts[index % demoProducts.length],
      demoProducts[(index + 7) % demoProducts.length],
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
      cashTendered: index % 3 === 0 ? subtotal + 5000 : null,
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

export async function ensureDemoData(
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
    await ensureDemoUsers(db, businessId, now);
    return;
  }

  await ensureDemoUsers(db, businessId, now);
  await ensureDemoCatalog(db, businessId, now);
  await ensureDemoTables(db, now);
  await ensureDemoOrders(db, businessId, now);
}

export async function ensureDemoImages(
  db: AppDatabase,
  businessId: string,
): Promise<void> {
  const productRows = await db
    .select({ categoryId: products.categoryId, id: products.id })
    .from(products)
    .where(eq(products.businessId, businessId));

  const imageRows = await (async () => {
    const { listProductImages } = await import(
      "@/modules/catalog/product-image.repository"
    );
    return listProductImages(
      db,
      productRows.map((row) => row.id),
    );
  })();

  const existing = new Set(imageRows.map((row) => row.productId));
  const missing = productRows.filter((row) => !existing.has(row.id));

  for (let index = 0; index < missing.length; index += 8) {
    const batch = missing.slice(index, index + 8);

    await Promise.allSettled(
      batch.map(async (product) => {
        const urls =
          demoImageUrls[product.categoryId] ?? demoImageUrls["category-kopi"];
        const imageUrl = urls[product.id.length % urls.length];
        const image = await fetchDemoImage(product.id, imageUrl);

        if (!image) {
          return;
        }

        try {
          await saveProductImage(db, businessId, product.id, image);
        } catch {
          // Best effort. Missing images must not break seed.
        }
      }),
    );
  }
}

const demoImageUrls: Record<string, string[]> = {
  "category-kopi": [
    "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&h=600&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-non-kopi": [
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&h=600&q=80",
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-teh": [
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-makanan": [
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&h=600&q=80",
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-dessert": [
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&h=600&q=80",
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-snack": [
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-roti": [
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-paket": [
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-minuman-dingin": [
    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&h=600&q=80",
  ],
  "category-seasonal": [
    "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&h=600&q=80",
  ],
};

async function fetchDemoImage(productId: string, imageUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(imageUrl, { signal: controller.signal });

    if (!response.ok) {
      return null;
    }

    const data = new Uint8Array(await response.arrayBuffer());

    if (
      data.length < 3 ||
      data[0] !== 0xff ||
      data[1] !== 0xd8 ||
      data[2] !== 0xff ||
      data.length > 5 * 1024 * 1024
    ) {
      return null;
    }

    return { data, mimeType: "image/jpeg" as const };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
