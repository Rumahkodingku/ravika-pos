export const PRODUCT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = PRODUCT_IMAGE_ACCEPT.split(",");
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

export async function compressProductImage(file: File) {
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Gambar harus JPEG, PNG, atau WebP.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Browser tidak dapat memproses gambar.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  const output = webp ?? (await canvasToBlob(canvas, "image/jpeg", 0.85));

  if (!output) {
    throw new Error("Gambar gagal dikompres.");
  }

  if (output.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new Error("Ukuran gambar setelah kompresi masih melebihi 5 MB.");
  }

  return output;
}
