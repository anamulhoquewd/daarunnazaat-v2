import { z } from "zod";
import { AdjustmentType, Branch } from "@/validations";

// Amount is signed paisa — negative reduces dueAmount, positive increases it.
// We accept a raw integer (already in paisa) since adjustments are admin-entered
// with full awareness of the amount.
const signedPaisaSchema = z.number().int({ message: "Amount must be an integer (paisa)" });

export const createAdjustmentZ = z.object({
  invoiceId: z.string().min(1),
  type: z.nativeEnum(AdjustmentType),
  amount: signedPaisaSchema.refine((v) => v !== 0, { message: "Amount cannot be zero" }),
  reason: z.string().min(10, "Reason must be at least 10 characters").trim(),
});

export const voidAdjustmentZ = z.object({
  reason: z.string().min(10, "Void reason must be at least 10 characters").trim(),
});

export const listAdjustmentsQueryZ = z.object({
  invoiceId: z.string().optional(),
  studentId: z.string().optional(),
  isVoided: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ICreateAdjustment = z.infer<typeof createAdjustmentZ>;
export type IVoidAdjustment = z.infer<typeof voidAdjustmentZ>;
