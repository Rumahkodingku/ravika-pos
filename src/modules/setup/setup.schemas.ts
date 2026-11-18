import { z } from "zod";

export const setupSchema = z
  .object({
    address: z.string().trim().max(240),
    businessCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{2,10}$/, "Kode bisnis 2 sampai 10 karakter.")
      .transform((value) => value.toUpperCase()),
    businessName: z.string().trim().min(1, "Nama bisnis wajib diisi.").max(120),
    confirmPassword: z
      .string()
      .min(8, "Konfirmasi kata sandi minimal 8 karakter."),
    ownerEmail: z.string().trim().email("Format email tidak valid."),
    ownerName: z.string().trim().min(1, "Nama owner wajib diisi.").max(120),
    ownerPassword: z.string().min(8, "Kata sandi minimal 8 karakter."),
    ownerUsername: z.string().trim().min(2).max(40).optional(),
    phone: z.string().trim().max(32),
  })
  .strict()
  .refine((value) => value.ownerPassword === value.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

export type SetupInput = z.infer<typeof setupSchema>;
