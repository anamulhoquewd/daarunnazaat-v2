import { z } from "zod";
import { studentZ } from ".";

export const personalInfoSchema = studentZ.pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  bloodGroup: true,
  fatherName: true,
  motherName: true,
  nid: true,
  birthCertificateNumber: true,
});

export const contactInfoSchema = studentZ.pick({
  alternativePhone: true,
  whatsApp: true,
});

export const presentAddress = studentZ.pick({
  presentAddress: true,
});

export const permanentAddress = studentZ.pick({
  permanentAddress: true,
});

export const guardianInfoSchema = studentZ.pick({
  guardianId: true,
  guardianRelation: true,
});

export const academicInfoSchema = studentZ.pick({
  studentId: true,
  classId: true,
  branch: true,
  batchType: true,
  currentSessionId: true,
  admissionDate: true,
});

export const feesSchema = studentZ.pick({
  admissionDate: true,
  admissionDiscount: true,
  monthlyFee: true,
  residentialFee: true,
  mealFee: true,
  isResidential: true,
  isMealIncluded: true,
  admissionFee: true,
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type Addresses = z.infer<typeof presentAddress> &
  z.infer<typeof permanentAddress>;
export type GuardianInfo = z.infer<typeof guardianInfoSchema>;
export type AcademicInfo = z.infer<typeof academicInfoSchema>;
export type Fees = z.infer<typeof feesSchema>;
