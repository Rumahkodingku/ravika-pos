import { z } from "zod";

export const roleCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    code: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .regex(/^[A-Za-z0-9_]+$/, "Kode role hanya huruf, angka, underscore."),
    description: z.string().trim().max(240).default(""),
    permissionCodes: z.array(z.string()).default([]),
  })
  .strict();

export const roleUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    code: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .regex(/^[A-Za-z0-9_]+$/, "Kode role hanya huruf, angka, underscore.")
      .optional(),
    description: z.string().trim().max(240).default(""),
  })
  .strict();

export const rolePermissionsSchema = z
  .object({
    permissionCodes: z.array(z.string()),
  })
  .strict();

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
