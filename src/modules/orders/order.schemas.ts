import { z } from "zod";

export const orderItemSchema = z
  .object({
    productId: z.string().min(1),
    variantId: z.string().nullable().optional().default(null),
    addOnIds: z.array(z.string()).default([]),
    quantity: z.number().int().min(1),
    notes: z.string().trim().max(240).default(""),
  })
  .strict();

export const orderCreateSchema = z
  .object({
    orderType: z.enum(["DINE_IN", "TAKEAWAY"]),
    tableId: z.string().nullable().default(null),
    notes: z.string().trim().max(500).default(""),
    items: z.array(orderItemSchema).min(1, "Pesanan minimal satu item."),
  })
  .strict();

export const publicOrderCreateSchema = z
  .object({
    tableToken: z.string().min(1),
    notes: z.string().trim().max(500).default(""),
    cashTendered: z.number().int().positive().nullable().default(null),
    items: z.array(orderItemSchema).min(1, "Pesanan minimal satu item."),
  })
  .strict();

export const cancelOrderSchema = z
  .object({
    reason: z.string().trim().min(3, "Alasan minimal 3 karakter.").max(240),
  })
  .strict();

export const kdsStatusSchema = z
  .object({
    nextStatus: z.enum(["ACCEPTED", "PREPARING", "READY", "COMPLETED"]),
  })
  .strict();

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type PublicOrderCreateInput = z.infer<typeof publicOrderCreateSchema>;
