import { z } from "zod";
import { BloodGroup, Branch, Gender, GuardianRelation } from "@/validations";
import { moneyInputSchema, paisaSchema } from "@/lib/money";

const addressZ = z.object({
  village: z.string().min(1),
  postOffice: z.string().min(1),
  upazila: z.string().min(1),
  district: z.string().min(1),
  division: z.string().optional(),
});

const optionalAddressZ = z.object({
  village: z.string().optional(),
  postOffice: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
});

const BDPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const createStudentZ = z
  .object({
    guardianId: z.string().min(1),
    guardianRelation: z.nativeEnum(GuardianRelation),
    classId: z.string().min(1),
    branch: z.nativeEnum(Branch),
    currentSessionId: z.string().min(1),

    fullName: z.string().min(2).trim(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.nativeEnum(Gender),
    bloodGroup: z.nativeEnum(BloodGroup).optional(),
    nid: z.string().optional(),
    birthCertificateNumber: z.string().optional(),

    phone: z
      .string()
      .regex(BDPhoneRegex, "Invalid BD phone number")
      .optional(),
    email: z
      .preprocess(
        (v) => (v === "" ? undefined : v),
        z.string().email().toLowerCase().optional(),
      )
      .optional(),
    whatsApp: z.string().optional(),
    avatar: z.string().optional(),
    remarks: z
      .preprocess((v) => (v === "" ? undefined : v), z.string().optional())
      .optional(),

    address: addressZ,
    permanentAddress: optionalAddressZ.optional(),

    isResidential: z.boolean().default(false),
    isMealIncluded: z.boolean().default(false),
    needsCoaching: z.boolean().default(false),
    needsDaycare: z.boolean().default(false),

    admissionDate: z.coerce.date(),

    // All money fields: accept string "1,500.50" or number, transform → paisa integer
    admissionFee: moneyInputSchema,
    receivedAmount: moneyInputSchema,
    monthlyFee: moneyInputSchema,
    residentialFee: moneyInputSchema.optional(),
    mealFee: moneyInputSchema.optional(),
    coachingFee: moneyInputSchema.optional(),
    daycareFee: moneyInputSchema.optional(),
  })
  .superRefine((d, ctx) => {
    if (d.isMealIncluded && d.mealFee == null) {
      ctx.addIssue({
        path: ["mealFee"],
        code: z.ZodIssueCode.custom,
        message: "Meal fee is required when meal is included",
      });
    }
    if (d.isResidential && d.residentialFee == null) {
      ctx.addIssue({
        path: ["residentialFee"],
        code: z.ZodIssueCode.custom,
        message: "Residential fee is required when residential is enabled",
      });
    }
    if (d.needsCoaching && d.coachingFee == null) {
      ctx.addIssue({
        path: ["coachingFee"],
        code: z.ZodIssueCode.custom,
        message: "Coaching fee is required when coaching is enabled",
      });
    }
    if (d.needsDaycare && d.daycareFee == null) {
      ctx.addIssue({
        path: ["daycareFee"],
        code: z.ZodIssueCode.custom,
        message: "Daycare fee is required when daycare is enabled",
      });
    }
  });

export const updateStudentZ = createStudentZ
  .omit({ guardianId: true, admissionFee: true, receivedAmount: true })
  .partial()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided for update",
  });

export const changeFeeZ = z.object({
  feeType: z.enum([
    "monthlyFee",
    "residentialFee",
    "mealFee",
    "coachingFee",
    "daycareFee",
  ]),
  newAmount: moneyInputSchema,
  effectiveFrom: z.coerce.date().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export type ICreateStudent = z.infer<typeof createStudentZ>;
export type IUpdateStudent = z.infer<typeof updateStudentZ>;
export type IChangeFee = z.infer<typeof changeFeeZ>;
