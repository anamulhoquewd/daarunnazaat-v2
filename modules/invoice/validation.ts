import { z } from "zod";
import { moneyInputSchema } from "@/lib/money";
import { Branch, InvoiceStatus } from "@/validations";

const lineItemInputZ = z.object({
  feeType: z.string().min(1),
  label: z.string().min(1),
  amount: moneyInputSchema,
  discount: z.preprocess((v) => v ?? 0, moneyInputSchema),
});

export const createInvoiceZ = z
  .object({
    studentId: z.string().min(1),
    sessionId: z.string().min(1),
    invoiceType: z.enum(["monthly", "admission", "exam_fee", "other"]),
    periodYear: z.number().int().min(2020).max(2100).nullable().optional(),
    periodMonth: z.number().int().min(1).max(12).nullable().optional(),
    lineItems: z.array(lineItemInputZ).min(1, "At least one line item is required"),
    dueDate: z.coerce.date().optional(),
    examId: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.invoiceType === "monthly") {
        return d.periodYear != null && d.periodMonth != null;
      }
      return true;
    },
    {
      message: "periodYear and periodMonth are required for monthly invoices",
      path: ["periodMonth"],
    },
  );

export const bulkGenerateInvoicesZ = z.object({
  sessionId: z.string().min(1),
  periodYear: z.number().int().min(2020).max(2100),
  periodMonth: z.number().int().min(1).max(12),
  branch: z.nativeEnum(Branch).optional(),
  classId: z.string().optional(),
  dryRun: z.boolean().default(false),
});

export const voidInvoiceZ = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const listInvoicesQueryZ = z.object({
  studentId: z.string().optional(),
  sessionId: z.string().optional(),
  branch: z.nativeEnum(Branch).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  periodYear: z.coerce.number().int().optional(),
  periodMonth: z.coerce.number().int().min(1).max(12).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ICreateInvoice = z.infer<typeof createInvoiceZ>;
export type IBulkGenerateInvoices = z.infer<typeof bulkGenerateInvoicesZ>;
export type IVoidInvoice = z.infer<typeof voidInvoiceZ>;
export type IListInvoicesQuery = z.infer<typeof listInvoicesQueryZ>;
