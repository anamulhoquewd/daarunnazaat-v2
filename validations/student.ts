import {
  addressSchema,
  BDPhoneRegex,
  IClass,
  IGuardian,
  IStudent,
  partialAddressSchema,
} from "@/validations";
import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  nid: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || /^\d{10}$|^\d{17}$/.test(val), {
      message: "NID must be either 10 or 17 digits",
    })
    .optional(),
  birthCertificateNumber: z.string().optional(),
});

export const contactInfoSchema = z.object({
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
});

export const address = z.object({
  address: addressSchema,
});

export const permanentAddress = z.object({
  permanentAddress: partialAddressSchema.optional(),
});

export const guardianInfoSchema = z.object({
  guardianId: z.string().optional(),
  guardianRelation: z.string().optional(),
});

export const academicInfoSchema = z.object({
  studentId: z.string().optional(),
  classId: z.string().optional(),
  branch: z.string().optional(),
  currentSessionId: z.string().optional(),
  admissionDate: z.coerce.date().optional(),
});

export const feesSchema = z.object({
  admissionFee: z.number().optional(),
  monthlyFee: z.number().optional(),
  daycareFee: z.number().optional(),
  coachingFee: z.number().optional(),
  residentialFee: z.number().optional(),
  mealFee: z.number().optional(),
  isResidential: z.boolean().optional(),
  isMealIncluded: z.boolean().optional(),
});

export const feeUpdateSchema = z.object({
  paymentDate: z.coerce.date().optional(),
  receivedAmount: z.union([z.string(), z.number()]).optional(),
  period: z.string().optional(),
  remarks: z.string().optional(),
  paymentMethod: z.string().optional(),
  payableAmount: z.union([z.string(), z.number()]).optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type Addresses = z.infer<typeof address> &
  z.infer<typeof permanentAddress>;
export type GuardianInfo = z.infer<typeof guardianInfoSchema>;
export type AcademicInfo = z.infer<typeof academicInfoSchema>;
export type Fees = z.infer<typeof feesSchema>;

export interface IStudentPopulated extends IStudent {
  class: IClass;
  guardian: IGuardian;
}
