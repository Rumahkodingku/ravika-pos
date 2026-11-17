import { z } from "zod";

export const loginSchema = z
  .object({
    identity: z.string().trim().min(1, "Email atau username wajib diisi."),
    password: z.string().min(1, "Kata sandi wajib diisi."),
    remember: z.boolean().optional().default(false),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter."),
  })
  .strict()
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Kata sandi baru harus berbeda dari kata sandi saat ini.",
    path: ["newPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
