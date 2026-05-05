import z from "zod";
import { Branch, PaymentMethod } from "@/validations";
import { paisaSchema } from "@/lib/money";

export const createSalaryZ = z.object({
  staffId: z.string().min(1),
  branch: z.nativeEnum(Branch),
  periodYear: z.number().int().min(2000).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  baseSalary: paisaSchema,
  bonus: z.preprocess((v) => v ?? 0, paisaSchema),
  deduction: z.preprocess((v) => v ?? 0, paisaSchema),
  notes: z.string().optional(),
});

export const payoutSalaryZ = z.object({
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  bonus: z.preprocess((v) => v ?? 0, paisaSchema),
  deduction: z.preprocess((v) => v ?? 0, paisaSchema),
  notes: z.string().optional(),
});

export const bulkGenerateZ = z.object({
  periodYear: z.number().int().min(2000).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  branch: z.nativeEnum(Branch).optional(),
});

export const listSalariesQueryZ = z.object({
  periodYear: z.coerce.number().int().optional(),
  periodMonth: z.coerce.number().int().min(1).max(12).optional(),
  staffId: z.string().optional(),
  branch: z.nativeEnum(Branch).optional(),
  status: z.enum(["pending", "paid"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ICreateSalary = z.infer<typeof createSalaryZ>;
export type IPayoutSalary = z.infer<typeof payoutSalaryZ>;
export type IBulkGenerate = z.infer<typeof bulkGenerateZ>;
