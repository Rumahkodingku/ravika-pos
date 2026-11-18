import { getDb } from "@/infrastructure/database/client";
import { requireAuth } from "@/modules/auth/session";
import {
  removeProductImage,
  saveProductImage,
} from "@/modules/catalog/product-image.service";
import { requirePermission } from "@/modules/rbac/authorization";
import { AppError } from "@/shared/errors/app-error";
import { assertSameOrigin } from "@/shared/http/request-context";
import { json, noContent, withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ id: string }> };

export const PUT = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "products.manage");

  const { id } = await context.params;
  const form = await request.formData();
  const image = form.get("image");

  if (!(image instanceof File)) {
    throw AppError.validation([
      { path: "image", message: "File gambar wajib diunggah." },
    ]);
  }

  const { db } = await getDb();
  const imageUrl = await saveProductImage(db, auth.businessId, id, {
    data: new Uint8Array(await image.arrayBuffer()),
    mimeType: image.type,
  });

  return json({ imageUrl });
});

export const DELETE = withApi<Context>(async (request, context) => {
  assertSameOrigin(request);

  const auth = await requireAuth();
  requirePermission(auth, "products.manage");

  const { id } = await context.params;
  const { db } = await getDb();

  await removeProductImage(db, auth.businessId, id);
  return noContent();
});
