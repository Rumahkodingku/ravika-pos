import { getDb } from "@/infrastructure/database/client";
import { getOrderByPublicToken } from "@/modules/orders/order.service";
import { AppError } from "@/shared/errors/app-error";
import { getClientIp } from "@/shared/http/request-context";
import { json, withApi } from "@/shared/http/route-handler";
import { consumeRateLimit } from "@/shared/rate-limit";

type Context = { params: Promise<{ publicToken: string }> };

export const GET = withApi<Context>(async (request, context) => {
  if (!consumeRateLimit(`public-status:${getClientIp(request)}`, 60, 60_000)) {
    throw AppError.rateLimited();
  }

  const { publicToken } = await context.params;
  const { db } = await getDb();
  const order = await getOrderByPublicToken(db, publicToken);

  return json({
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    grandTotal: order.grandTotal,
    tableName: order.tableName ?? null,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      addOns: item.addOns.map((addOn) => ({
        name: addOn.name,
        price: addOn.price,
        quantity: addOn.quantity,
      })),
    })),
  });
});
