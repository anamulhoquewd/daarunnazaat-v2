import { IStudent, studentZ } from "@/validations";
import { FieldPath } from "react-hook-form";
import z from "zod";

// STEP SCHEMAS
// User Step
export const step1Z = studentZ.pick({
  userId: true,
});
// Personal Information Step
export const step2Z = studentZ.pick({
  firstName: true,
  lastName: true,
  gender: true,
  dateOfBirth: true,
  fatherName: true,
  motherName: true,
  nid: true,
  birthCertificateNumber: true,
  bloodGroup: true,
  guardianId: true,
  guardianRelation: true,
});
// Academic Step
export const step3Z = studentZ.pick({
  branch: true,
  batchType: true,
  classId: true,
  currentSessionId: true,
  admissionDate: true,
});
// Contact Step
export const step4Z = studentZ.pick({
  alternativePhone: true,
  whatsApp: true,
});
// Address Step
export const step5Z = studentZ.pick({
  presentAddress: true,
  permanentAddress: true,
});
// Admission & Fees Step
export const step6Z = studentZ.pick({
  isResidential: true,
  isMealIncluded: true,
  admissionFee: true,
  monthlyFee: true,
  residentialFee: true,
  admissionDiscount: true,
  mealFee: true,
});

export const studentFinalZ = studentZ.superRefine((data, ctx) => {
  if (data.isResidential && !data.residentialFee) {
    ctx.addIssue({
      path: ["residentialFee"],
      message: "Residential fee is required",
      code: z.ZodIssueCode.custom,
    });
  }

  if (data.isMealIncluded && !data.mealFee) {
    ctx.addIssue({
      path: ["mealFee"],
      message: "Meal fee is required",
      code: z.ZodIssueCode.custom,
    });
  }
});

export const steps = [
  "user",
  "personal",
  "contact",
  "address",
  "academic",
  "fees",
  "preview",
] as const;

export type StepKey = (typeof steps)[number];
export const stepFields: Record<StepKey, FieldPath<IStudent>[]> = {
  user: ["userId"],

  personal: [
    "firstName",
    "lastName",
    "gender",
    "guardianId",
    "guardianRelation",
    "dateOfBirth",
    "fatherName",
    "motherName",
    "nid",
    "birthCertificateNumber",
    "bloodGroup",
  ],

  contact: ["alternativePhone", "whatsApp"],

  address: [
    "presentAddress.village",
    "presentAddress.postOffice",
    "presentAddress.upazila",
    "presentAddress.district",

    // optional
    "permanentAddress.village",
    "permanentAddress.postOffice",
    "permanentAddress.upazila",
    "permanentAddress.district",
  ],

  academic: [
    "classId",
    "branch",
    "batchType",
    "admissionDate",
    "currentSessionId",
  ],

  fees: [
    "admissionFee",
    "monthlyFee",
    "residentialFee",
    "mealFee",
    "isResidential",
    "isMealIncluded",
    "admissionDiscount",
  ],

  preview: [],
};
