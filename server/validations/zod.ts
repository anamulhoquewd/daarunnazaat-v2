// validation/admin.validation.ts
import mongoose from "mongoose";
import { z } from "zod";

// Accept either a 24-char hex string or a real ObjectId instance
export const objectIdSchemaZ = z.union([
  z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Expected a 24-char hex ObjectId string"),
  z.instanceof(mongoose.Types.ObjectId),
]);

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

// Admin (Amdin) validation
export const adminCreateZ = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  role: z.enum(["super_admin", "admin"]),
  address: z.string().optional(),
  designation: z.string().optional(),
  join_date: z.coerce.date().optional(),
  is_active: z.boolean().default(true),
  is_blocked: z.boolean().default(false),
  blockedAt: z.date().optional(),
});

// If you want a separate update schema where fields can be optional:
export const adminUpdateZ = adminCreateZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" }
);

// Types (optional)
export type TAdminCreate = z.infer<typeof adminCreateZ>;
export type TAdminUpdate = z.infer<typeof adminUpdateZ>;

//  Validate the ID (MongoDB ObjectId format)
export const idSchemaZ = z.object({
  _id: z
    .any()
    .transform((val) =>
      val instanceof mongoose.Types.ObjectId ? val.toString() : val
    )
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid MongoDB User ID format",
    }),
});

export const changePasswordZ = z
  .object({
    currentPassword: z.string().min(8).max(20),
    newPassword: z.string().min(8).max(20),
    confirmPassword: z.string().min(8).max(20),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordZ = z.object({
  email: z.string().email(),
});

// Student validation
export const studentCreateZ = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  guardian_name: z.string().min(2, "Name must be at least 2 characters").trim(),
  guardian_phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  admission_date: z.coerce.date().optional(),
  is_active: z.boolean().default(true),
  date_of_birth: z.coerce.date().optional(),
  gender: z.enum(["male", "female"]).optional(),
  address: z.string().optional(),
  id_card: z.string().optional(),
  roll: z.number().optional(),
  monthly_fee: z.number(),
  class_id: objectIdSchemaZ,
});

// If you want a separate update schema where fields can be optional:
export const studentUpdateZ = studentCreateZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" }
);

// Types (optional)
export type TStudentCreate = z.infer<typeof studentCreateZ>;
export type TStudentUpdate = z.infer<typeof studentUpdateZ>;

export const loginSchemeZ = z
  .object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .length(11, "Phone number must be 11 characters long")
      .optional(),
    password: z.string().min(8).max(20),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"], // Can also use "phone" or leave empty
  });

// Class validation
export const classCreateZ = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  teacher: z.string().optional(),
  description: z.string().optional(),
  opening_date: z.coerce.date().optional(),
});

// If you want a separate update schema where fields can be optional:
export const classUpdateZ = classCreateZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" }
);

// Types (optional)
export type TClassCreate = z.infer<typeof classCreateZ>;
export type TClassUpdate = z.infer<typeof classUpdateZ>;

// Class validation
export const paymentCreateZ = z.object({
  admin_id: objectIdSchemaZ,
  student_id: objectIdSchemaZ,
  amount: z.number().positive(),
  month: z.enum([
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ]),
  year: z.number(),
  paid_at: z.coerce.date(),
});

// If you want a separate update schema where fields can be optional:
export const paymentUpdateZ = paymentCreateZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" }
);

// Types (optional)
export type TPaymentCreate = z.infer<typeof paymentCreateZ>;
export type TPaymentUpdate = z.infer<typeof paymentUpdateZ>;
