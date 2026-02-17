import { z } from "zod";
import { staffZ } from ".";

export const staffInfoSchema = staffZ.pick({
  branch: true,
  joinDate: true,
  designation: true,
  department: true,
  basicSalary: true,
});

export type StaffInfo = z.infer<typeof staffInfoSchema>;
