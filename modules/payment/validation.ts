import { z } from "zod";
import { moneyInputSchema } from "@/lib/money";
import { Branch, PaymentMethod } from "@/validations";

const allocationInputZ = z.object({
  invoiceId: z.string().min(1),
  allocatedAmount: moneyInputSchema,
});

export const createPaymentZ = z
  .object({
    studentId: z.string().min(1),
    sessionId: z.string().min(1),
    branch: z.nativeEnum(Branch),
    paymentDate: z.coerce.date().optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    totalPaid: moneyInputSchema,
    allocations: z.array(allocationInputZ).default([]),
    notes: z.string().optional(),
  })
  .refine(
    (d) => {
      const allocSum = d.allocations.reduce((s, a) => s + a.allocatedAmount, 0);
      return allocSum <= d.totalPaid;
    },
    {
      message: "Sum of allocations cannot exceed totalPaid",
      path: ["allocations"],
    },
  );

export const listPaymentsQueryZ = z.object({
  studentId: z.string().optional(),
  sessionId: z.string().optional(),
  branch: z.nativeEnum(Branch).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ICreatePayment = z.infer<typeof createPaymentZ>;
export type IListPaymentsQuery = z.infer<typeof listPaymentsQueryZ>;
