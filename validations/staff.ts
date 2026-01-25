import { z } from "zod";
import { staffZ } from ".";

export const staffPpersonalInfoSchema = staffZ.pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  bloodGroup: true,
  nid: true,
  birthCertificateNumber: true,
});

export const staffInfoSchema = staffZ.pick({
  branch: true,
  joinDate: true,
  designation: true,
  department: true,
  basicSalary: true,
});

export type PersonalInfo = z.infer<typeof staffPpersonalInfoSchema>;
export type StaffInfo = z.infer<typeof staffInfoSchema>;
