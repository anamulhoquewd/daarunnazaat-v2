import { z } from "zod";

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
  address: z.string(),
  designation: z.string(),
  join_date: z.coerce.date(),
  is_active: z.boolean(),
  is_blocked: z.boolean(),
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

// Types (optional)
export type TChangePassowrd = z.infer<typeof changePasswordZ>;

export const forgotPasswordZ = z.object({
  email: z.string().email(),
});

// Types (optional)
export type TForgotPassowrd = z.infer<typeof forgotPasswordZ>;

// Student validation
export const studentCreateZ = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  guardian_name: z.string().min(2, "Name must be at least 2 characters").trim(),
  guardian_phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  admission_date: z.date().optional(),
  is_active: z.boolean(),
  date_of_birth: z.date().optional(),
  gender: z.enum(["male", "female"]).optional(),
  address: z.string().optional(),
  id_card: z.string().optional(),
  roll: z.number().optional(),
  monthly_fee: z.coerce.number(),
  class_id: z.union([
    z
      .string()
      .regex(/^[a-fA-F0-9]{24}$/, "Expected a 24-char hex ObjectId string"),
  ]),
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

export const signInSchemeZ = z.object({
  email: z
    .string()
    .refine(
      (value) =>
        BDPhoneRegex.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        message: "Must be a valid email or 11-digit phone number",
      }
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters"),
});

// Types (optional)
export type TSignIn = z.infer<typeof signInSchemeZ>;

export const resetPasswordZ = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password cannot exceed 20 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Types (optional)
export type TResetPassword = z.infer<typeof resetPasswordZ>;

// Class validation
export const classCreateZ = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  teacher: z.string().optional(),
  description: z.string().optional(),
  opening_date: z.date().optional(),
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
  student_id: z.union([
    z
      .string()
      .regex(/^[a-fA-F0-9]{24}$/, "Expected a 24-char hex ObjectId string"),
  ]),
  amount: z.coerce.number().positive(),
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
  year: z.coerce.number().min(2025),
  paid_at: z.date(),
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
