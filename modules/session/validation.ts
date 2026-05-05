import { z } from "zod";
import { SessionCycleType } from "@/validations";

export const createSessionZ = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    cycleType: z.nativeEnum(SessionCycleType),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    monthCount: z
      .number()
      .int()
      .min(1, "At least 1 month")
      .max(24, "Max 24 months"),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateSessionZ = createSessionZ
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(
    (d) =>
      d.startDate == null ||
      d.endDate == null ||
      d.endDate > d.startDate,
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type ICreateSession = z.infer<typeof createSessionZ>;
export type IUpdateSession = z.infer<typeof updateSessionZ>;
