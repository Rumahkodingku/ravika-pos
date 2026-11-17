import { z } from "zod";

export const businessSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama bisnis wajib diisi.")
      .max(120, "Nama bisnis maksimal 120 karakter."),
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{2,10}$/, "Kode bisnis 2 sampai 10 karakter.")
      .transform((value) => value.toUpperCase()),
    address: z.string().trim().max(240, "Alamat maksimal 240 karakter."),
    phone: z.string().trim().max(32, "Telepon maksimal 32 karakter."),
  })
  .strict();

export type BusinessInput = z.infer<typeof businessSchema>;
