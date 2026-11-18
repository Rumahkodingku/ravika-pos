import { z } from "zod";

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
    email: z.string().trim().email("Format email tidak valid."),
    username: z.string().trim().min(2).max(40).optional(),
    role: z.string().trim().min(1, "Role wajib dipilih."),
    password: z.string().min(8, "Kata sandi minimal 8 karakter."),
    isActive: z.boolean().default(true),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
    email: z.string().trim().email("Format email tidak valid."),
    username: z.string().trim().min(2).max(40).optional(),
    role: z.string().trim().min(1, "Role wajib dipilih."),
    isActive: z.boolean(),
  })
  .strict();

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
