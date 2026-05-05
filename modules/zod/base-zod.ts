import z from "zod";

export const baseFieldsZ = z.object({
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.coerce.date().nullish().optional(),
  deletedBy: z.string().nullish().optional(),
  deleteReason: z.string().nullish().optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
