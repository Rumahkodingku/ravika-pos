import { z } from "zod";

export const categorySchema = z
  .object({
    name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(80),
    description: z.string().trim().max(240).default(""),
    sortOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .strict();

export const categoryMoveSchema = z
  .object({ direction: z.enum(["up", "down"]) })
  .strict();

const variantSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Nama varian wajib diisi.").max(80),
    priceAdjustment: z.number().int().min(0),
    isActive: z.boolean().default(true),
  })
  .strict();

const addOnRelationSchema = z
  .object({
    addOnId: z.string().min(1, "Add-on wajib dipilih."),
    isRequired: z.boolean().default(false),
    minSelection: z.number().int().min(0),
    maxSelection: z.number().int().min(1),
  })
  .strict()
  .refine((value) => value.minSelection <= value.maxSelection, {
    message: "Minimum tidak boleh lebih dari maksimum.",
    path: ["maxSelection"],
  });

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Nama produk wajib diisi.").max(120),
    description: z.string().trim().max(500).default(""),
    categoryId: z.string().min(1, "Kategori wajib dipilih."),
    basePrice: z.number().int().min(0, "Harga minimal 0."),
    isAvailable: z.boolean().default(true),
    isActive: z.boolean().default(true),
    variants: z.array(variantSchema).default([]),
    addOns: z.array(addOnRelationSchema).default([]),
  })
  .strict();

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
