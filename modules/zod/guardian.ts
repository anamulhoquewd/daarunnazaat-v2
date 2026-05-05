import {
  addressSchema,
  BDPhoneRegex,
  BloodGroup,
  Gender,
  moneyZ,
  mongoIdStringZ,
} from "@/validations";
import z from "zod";
import { baseFieldsZ } from "./base-zod";

export const createGuardianZ = baseFieldsZ.extend({
  userId: mongoIdStringZ,
  guardianId: z.string().optional(),
  fullName: z.string().min(1).trim(),
  gender: z.enum(Gender),
  bloodGroup: z.enum(BloodGroup).optional(),
  avatar: z.string().url().optional(),
  nid: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || /^\d{10}$|^\d{17}$/.test(val), {
      message: "NID must be either 10 or 17 digits",
    })
    .optional(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  alternativePhone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  whatsApp: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  occupation: z.string().optional(),
  monthlyIncome: moneyZ.optional(),
  address: addressSchema,

  isActive: z.boolean().optional(),
});
