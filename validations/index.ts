import mongoose from "mongoose";
import z from "zod";

// ── Roles ──────────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  STAFF = "staff",
  GUARDIAN = "guardian",
}

// ── Demographics ───────────────────────────────────────────────────────────────

export enum Gender {
  MALE = "male",
  FEMALE = "female",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  UNKNOWN = "unknown",
  NON = "Non",
}

export enum GuardianRelation {
  FATHER = "father",
  MOTHER = "mother",
  UNCLE = "uncle",
  AUNT = "aunt",
  BROTHER = "brother",
  SISTER = "sister",
  GRANDFATHER = "grandfather",
  GRANDMOTHER = "grandmother",
  OTHER = "other",
}

// ── Branch ─────────────────────────────────────────────────────────────────────

export enum Branch {
  BALIKA = "Balika Branch",
  BALOK = "Balok Branch",
  // Legacy aliases
  BALIKA_BRANCH = "Balika Branch",
  BALOK_BRANCH = "Balok Branch",
}

// ── Session ────────────────────────────────────────────────────────────────────

export enum SessionCycleType {
  JAN_DEC = "JAN_DEC",
  RAMADAN = "RAMADAN",
}

// ── Enrollment ─────────────────────────────────────────────────────────────────

export enum EnrollmentStatus {
  ONGOING = "ongoing",
  PROMOTED = "promoted",
  REPEATED = "repeated",
  DROPPED = "dropped",
  GRADUATED = "graduated",
}

// ── Finance ────────────────────────────────────────────────────────────────────

export enum PaymentMethod {
  CASH = "cash",
  BKASH = "bkash",
  NAGAD = "nagad",
  BANK_TRANSFER = "bank_transfer",
  CHEQUE = "cheque",
  MOBILE_BANKING = "mobile_banking",
}

export enum PaymentSource {
  ADMIN = "admin",
  GUARDIAN_ONLINE = "guardian_online",
  OFFICE = "office",
}

export enum InvoiceStatus {
  UNPAID = "unpaid",
  PARTIAL = "partial",
  PAID = "paid",
  VOID = "void",
}

export enum InvoiceType {
  MONTHLY = "monthly",
  ADMISSION = "admission",
  EXAM_FEE = "exam_fee",
  OTHER = "other",
}

export enum AdjustmentType {
  WAIVER = "waiver",
  DISCOUNT = "discount",
  REFUND = "refund",
  CORRECTION = "correction",
  SCHOLARSHIP = "scholarship",
  LATE_FEE = "late_fee",
}

export enum OnlinePaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum OnlinePaymentProvider {
  BKASH = "bkash",
  NAGAD = "nagad",
}

// ── Salary ─────────────────────────────────────────────────────────────────────

export enum SalaryStatus {
  PENDING = "pending",
  PAID = "paid",
}

// ── Expense ────────────────────────────────────────────────────────────────────

export enum ExpenseCategory {
  FOOD = "food",
  RENT = "rent",
  ELECTRICITY = "electricity",
  GAS = "gas",
  WATER = "water",
  SUPPLIES = "supplies",
  TRAVEL = "travel",
  MARKETING = "marketing",
  MAINTENANCE = "maintenance",
  OTHER = "other",
  EXOSORIZE = "exosorize",
}

// ── Exam ───────────────────────────────────────────────────────────────────────

export enum ExamCategory {
  MIDTERM = "midterm",
  FINAL = "final",
  MONTHLY = "monthly",
  MOCK = "mock",
  BEFAQ = "befaq",
  OTHER = "other",
  // Legacy
  TERMINAL = "terminal",
}

export enum ExamStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  COMPLETED = "completed",
  // Legacy
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  RESULTS_PUBLISHED = "results_published",
}

export enum BefaqGrade {
  MUMTAZ = "Mumtaz",
  JAYYID_JIDDAN = "Jayyid Jiddan",
  JAYYID = "Jayyid",
  MAQBUL = "Maqbul",
  RASIB = "Rasib",
}

// ── Shared zod helpers ─────────────────────────────────────────────────────────

export const moneyZ = z.coerce.number().min(0, "Amount cannot be negative");

/** String-only ObjectId validator — use in new module schemas */
export const mongoIdStringZ = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

/** Flexible ObjectId validator — accepts string or ObjectId instance, returns string */
export const mongoZ = z
  .any()
  .transform((val) =>
    val instanceof mongoose.Types.ObjectId ? val.toString() : val,
  )
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

/** Legacy: used by old services as mongoIdZ.safeParse({ _id: someId }).data._id */
export const mongoIdZ = z.object({ _id: mongoZ });

export const addressSchema = z.object({
  village: z.string().min(1),
  postOffice: z.string().min(1),
  upazila: z.string().min(1),
  district: z.string().min(1),
  division: z.string().optional(),
});

export const partialAddressSchema = addressSchema.partial();

// ── Legacy types & schemas (kept for backward compatibility with old server code) ──

export interface IUser {
  _id?: any;
  name?: string;
  email: string;
  phone: string;
  password?: string;
  roles: UserRole[];
  isActive?: boolean;
  isBlocked?: boolean;
  blockedAt?: Date | null;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  lastLogin?: Date | null;
  refreshTokens: string[];
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  matchPassword: (password: string) => Promise<boolean>;
  generateResetPasswordToken: (expMinutes?: number) => string;
  [key: string]: any;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  SALARY = "salary",
  FEE = "fee",
  REFUND = "refund",
  ADJUSTMENT = "adjustment",
  REVERSAL = "reversal",
}

export interface ITransactionLog {
  _id?: any;
  transactionType: TransactionType;
  referenceId: any;
  referenceModel: "FeeCollection" | "Salary" | "Expense" | "SalaryPayment";
  amount: number;
  description: string;
  performedBy: any;
  branch: Branch;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuardian {
  _id?: any;
  guardianId?: string;
  fullName: string;
  phone: string;
  [key: string]: any;
}

export interface IStaff {
  _id?: any;
  staffId?: string;
  fullName: string;
  designation?: string;
  [key: string]: any;
}

export interface IClass {
  _id?: any;
  name: string;
  className?: string;
  order?: number;
  isActive?: boolean;
  [key: string]: any;
}

export interface IStudent {
  _id?: any;
  studentId?: string;
  fullName: string;
  branch?: Branch;
  [key: string]: any;
}

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

// Auth Zod schemas (used by server/services/users.service.ts)

export const userZ = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
});

export const loginZ = z.object({
  email: z
    .string()
    .refine(
      (value) =>
        BDPhoneRegex.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      {
        message: "Must be a valid email or 11-digit phone number",
      },
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters"),
});

export const changePasswordZ = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
});

export const passwordResetZ = z.object({
  email: z.string().email(),
});

export const resetTokenZ = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

export const userUpdateZ = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
  isActive: z.boolean().optional(),
});

export const transactionLogZ = z.object({
  transactionType: z.nativeEnum(TransactionType),
  referenceId: z.string(),
  referenceModel: z.enum(["FeeCollection", "Salary", "Expense"]),
  amount: z.number(),
  description: z.string(),
  performedBy: z.string(),
  branch: z.nativeEnum(Branch),
});

// Old validation schema stubs (used by validations/student.ts, guardian.ts, staff.ts)
export const guardianZ = z.object({}).catchall(z.any());
export const staffZ = z.object({}).catchall(z.any());
export const studentZ = z.object({}).catchall(z.any());
export const feeCollectionZ = z.object({}).catchall(z.any());

// ── Legacy enums ───────────────────────────────────────────────────────────────

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  LEAVE = "leave",
}

export enum BatchType {
  MORNING = "morning",
  EVENING = "evening",
  NIGHT = "night",
  JANUARY_DECEMBER = "january_december",
  RAMADAN_RAMADAN = "ramadan_ramadan",
}

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum FeeType {
  MONTHLY = "monthly",
  ADMISSION = "admission",
  EXAM = "exam",
  OTHER = "other",
  COACHING = "coaching",
  DAYCARE = "daycare",
  RESIDENTIAL = "residential",
  MEAL = "meal",
  UTILITY = "utility",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  PARTIAL = "partial",
  WAIVED = "waived",
  DUE = "due",
  OVERDUE = "overdue",
}

export enum NoticeAudience {
  ALL = "all",
  GUARDIANS = "guardians",
  STAFF = "staff",
  STUDENTS = "students",
}

export enum NoticePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// ── Legacy interface stubs ─────────────────────────────────────────────────────

export type IBlog = Record<string, any>;
export type IExam = Record<string, any>;
export type IExamEnrollment = Record<string, any>;
export type IExpense = Record<string, any>;
export type IExpenseUpdate = Record<string, any>;
export type IForgotPassowrd = { email: string };
export type INotice = Record<string, any>;
export type IPayAdmissionDue = Record<string, any>;
export type IResetPassword = Record<string, any>;
export type IResult = Record<string, any>;
export type ISalaryPayment = Record<string, any>;
export type ISalaryPaymentUpdate = Record<string, any>;
export type ISession = Record<string, any>;
export type ISignIn = { email?: string; phone?: string; password: string };
export type IStaffAttendance = Record<string, any>;
export type IAttendance = Record<string, any>;
export type ISubject = Record<string, any>;
export type IUpdateClass = Record<string, any>;
export type IUpdateGuardian = Record<string, any>;
export type IUpdateSession = Record<string, any>;
export type IUpdateStaff = Record<string, any>;
export type IUpdateStudent = Record<string, any>;
export type IUpdateUser = Record<string, any>;
export type IFeeCollection = Record<string, any>;
export type monthlyFees = Record<string, any>;
export const monthlyFees = {} as Record<string, any>;

// ── Legacy Zod schema stubs ────────────────────────────────────────────────────

const _stub = z.object({}).catchall(z.any());
export const addExamPaymentZ = _stub;
export const blogUpdateZ = _stub;
export const blogZ = _stub;
export const classUpdateZ = _stub;
export const examUpdateZ = _stub;
export const examZ = _stub;
export const expenseUpdateZ = _stub;
export const expenseZ = _stub;
export const forgotPasswordZ = z.object({ email: z.string().email() });
export const guardianUpdateZ = _stub;
export const payAdmissionDueZ = _stub;
export const resetPasswordZ = _stub;
export const salaryPaymentUpdateZ = _stub;
export const salaryPaymentZ = _stub;
export const sessionUpdateZ = _stub;
export const sessionZ = _stub;
export const signInZ = z.object({
  email: z.string().optional(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  password: z.string(),
});
export const staffUpdateZ = _stub;
export const studentUpdateZ = _stub;
export const subjectUpdateZ = _stub;
export const subjectZ = _stub;
export const submitResultsBulkZ = _stub;
export const classZ = _stub;
export const feeCollectionsUpdateZ = _stub;
// mongoZ is defined above in the shared zod helpers section

export type TChangePassword = z.infer<typeof changePasswordZ>;

export enum ExamFeeStatus {
  PENDING = "pending",
  UNPAID = "unpaid",
  PARTIAL = "partial",
  PAID = "paid",
  WAIVED = "waived",
}

export enum NoticeType {
  GENERAL = "general",
  URGENT = "urgent",
  EVENT = "event",
}
