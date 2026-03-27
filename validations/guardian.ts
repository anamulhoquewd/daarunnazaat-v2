import { z } from "zod";
import { guardianZ } from ".";

export const guardianPpersonalInfoSchema = guardianZ.pick({
  fullName: true,
  gender: true,
  bloodGroup: true,
  nid: true,
  birthCertificateNumber: true,
  occupation: true,
  monthlyIncome: true,
});

export type GuardianPersonalInfo = z.infer<typeof guardianPpersonalInfoSchema>;
