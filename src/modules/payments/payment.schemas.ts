import { z } from "zod";

export const paymentCreateSchema = z
  .object({
    method: z.enum(["CASH", "QRIS", "TRANSFER", "E_WALLET"]),
    amount: z.number().int().positive("Nominal harus lebih dari 0."),
    reference: z.string().trim().max(120).default(""),
    notes: z.string().trim().max(240).default(""),
    verified: z.boolean().default(false),
  })
  .strict();

export const refundSchema = z
  .object({
    reason: z.string().trim().min(3, "Alasan minimal 3 karakter.").max(240),
  })
  .strict();

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
