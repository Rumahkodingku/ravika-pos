import { getDb } from "@/infrastructure/database/client";
import { getProductImage } from "@/modules/catalog/product-image.service";
import { withApi } from "@/shared/http/route-handler";

type Context = { params: Promise<{ productId: string }> };

export const GET = withApi<Context>(async (_request, context) => {
  const { productId } = await context.params;
  const { db } = await getDb();
  const image = await getProductImage(db, productId);

  return new Response(new Uint8Array(image.data), {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-length": String(image.fileSize),
      "content-type": image.mimeType,
      etag: `"${image.checksum}"`,
      "x-content-type-options": "nosniff",
    },
  });
});
