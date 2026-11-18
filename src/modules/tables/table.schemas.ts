import { z } from "zod";

export const tableSchema = z
  .object({
    name: z.string().trim().min(1, "Nama meja wajib diisi.").max(60),
    status: z.enum(["AVAILABLE", "OCCUPIED", "INACTIVE"]),
    isActive: z.boolean(),
  })
  .strict();

export type TableInput = z.infer<typeof tableSchema>;
