import { z } from "zod";

export const addressSchema = z.object({
  village: z.string().min(1, "Village is required"),
  postOffice: z.string().min(1, "Post office is required"),
  upazila: z.string().min(1, "Upazila is required"),
  district: z.string().min(1, "District is required"),
  division: z.string().optional(),
});

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  dateOfBirth: z.date(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  nid: z.string().optional(),
  birthCertificateNumber: z.string().optional(),
});

export const contactInfoSchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  alternativePhone: z.string().optional(),
  whatsApp: z.string().optional(),
});

export const addressesSchema = z.object({
  presentAddress: addressSchema,
  permanentAddress: addressSchema.optional(),
});

export const guardianInfoSchema = z.object({
  guardianId: z.string(),
  guardianName: z.string(),
  guardianRelation: z.string(),
  guardianPhone: z.string().optional(),
});

export const academicInfoSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  branch: z.string(),
  batchType: z.string(),
  currentSessionId: z.string(),
  admissionDate: z.date(),
});

export const feesSchema = z.object({
  admissionFee: z.number().min(0, "Must be non-negative"),
  admissionDiscount: z.number().min(0, "Must be non-negative"),
  monthlyFee: z.number().min(0, "Must be non-negative"),
  residentialFee: z.number().min(0, "Must be non-negative"),
  mealFee: z.number().min(0, "Must be non-negative"),
  isResidential: z.boolean(),
  isMealIncluded: z.boolean(),
});

export const studentProfileSchema = z.object({
  personalInfo: personalInfoSchema,
  contactInfo: contactInfoSchema,
  addresses: addressesSchema,
  guardianInfo: guardianInfoSchema,
  academicInfo: academicInfoSchema,
  fees: feesSchema,
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Addresses = z.infer<typeof addressesSchema>;
export type GuardianInfo = z.infer<typeof guardianInfoSchema>;
export type AcademicInfo = z.infer<typeof academicInfoSchema>;
export type Fees = z.infer<typeof feesSchema>;
export type StudentProfile = z.infer<typeof studentProfileSchema>;
