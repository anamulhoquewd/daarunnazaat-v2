import mongoose, { Schema, Model, Document, Types } from "mongoose";
import z from "zod";

// ==================== ENUMS ====================
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  STAFF = "staff",
  STUDENT = "student",
  GUARDIAN = "guardian",
}

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
}

export enum Branch {
  BRANCH_1 = "branch_1",
  BRANCH_2 = "branch_2",
}

export enum GuardianRelation {
  FATHER = "Father",
  MOTHER = "Mother",
  UNCALE = "Uncle",
  AUNT = "Aunt",
  BROTHER = "Brother",
  SISTER = "Sister",
  GRAND_FATHER = "Grandfather",
  GRAND_MOTHER = "Grandmother",
  OTHER = "Other",
}

export enum BatchType {
  JANUARY_DECEMBER = "january_december",
  RAMADAN_RAMADAN = "ramadan_ramadan",
}

export enum FeeType {
  ADMISSION = "admission",
  MONTHLY = "monthly",
  RESIDENTIAL = "residential",
  COACHING = "coaching",
  DAYCARE = "daycare",
  UTILITY = "utility",
  MEAL = "meal",
  OTHER = "other",
}

export enum PaymentStatus {
  PAID = "paid",
  PARTIAL = "partial",
  DUE = "due",
  OVERDUE = "overdue",
}

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  MOBILE_BANKING = "mobile_banking",
  CHEQUE = "cheque",
}

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export enum ExpenseCategory {
  SALARY = "salary",
  RENT = "rent",
  ELECTRICITY = "electricity",
  GAS = "gas",
  WATER = "water",
  MAINTENANCE = "maintenance",
  SUPPLIES = "supplies",
  OTHER = "other",
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
  LEAVE = "leave",
}

export enum ExamType {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  MIDTERM = "midterm",
  FINAL = "final",
  ANNUAL = "annual",
}

export enum BookStatus {
  AVAILABLE = "available",
  ISSUED = "issued",
  LOST = "lost",
  DAMAGED = "damaged",
}

export enum NoticeType {
  GENERAL = "general",
  URGENT = "urgent",
  EVENT = "event",
  HOLIDAY = "holiday",
  EXAM = "exam",
}

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// ==================== ZOD SCHEMAS ====================

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

// Image validation
export const imageZ = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
});

// User Schema
export const userZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  email: z.string().email(),
  phone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  alternativePhone: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  whatsApp: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim()
    .optional(),
  role: z.nativeEnum(UserRole),
  nid: z
    .string()
    .refine((val) => /^\d{10}$|^\d{17}$/.test(val), {
      message: "NID must be either 10 or 17 digits",
    })
    .trim(),
  isActive: z.boolean().optional(),
  lastLogin: z.coerce.date().optional(),
  refreshTokens: z.array(z.string()).optional(),
  passwordResetToken: z.string().nullable().optional(),
  ResetTokenExpires: z.coerce.date().optional(),

  isBlocked: z.boolean().optional(),
  blockedAt: z.coerce.date().optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// If you want a separate update  where fields can be optional:
export const userUpdateZ = userZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" }
);

// change password
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

// Person Base Schema (for common fields)
const personBaseZ = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  gender: z.nativeEnum(Gender),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  nidNumber: z.string().optional(),
  birthCertificateNumber: z.string().optional(),
  presentAddress: z.object({
    village: z.string(),
    postOffice: z.string(),
    upazila: z.string(),
    district: z.string(),
    division: z.string().optional(),
  }),
  permanentAddress: z
    .object({
      village: z.string(),
      postOffice: z.string(),
      upazila: z.string(),
      district: z.string(),
      division: z.string().optional(),
    })
    .optional(),
  avatar: z.string().optional(),
});

// Student Schema
export const studentZ = personBaseZ.extend({
  _id: z.instanceof(Types.ObjectId).optional(),
  userId: z.instanceof(Types.ObjectId),
  studentId: z.string(),
  guardianId: z.instanceof(Types.ObjectId),
  guardianRelation: z.nativeEnum(BatchType),
  classId: z.instanceof(Types.ObjectId),
  branch: z.nativeEnum(Branch),
  batchType: z.nativeEnum(BatchType),
  admissionDate: z.coerce.date(),
  isResidential: z.boolean().default(false),
  isMealIncluded: z.boolean().default(false),
  admissionFee: z.number().min(0),
  admissionDiscount: z.number().min(0).default(0),
  monthlyFee: z.number().min(0),
  monthlyDiscount: z.number().min(0).default(0),
  residentialFee: z.number().min(0).optional(),
  mealFee: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  passoutDate: z.coerce.date().optional(), // fareg
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Guardian Schema
export const guardianZ = personBaseZ.omit({ dateOfBirth: true }).extend({
  _id: z.instanceof(Types.ObjectId).optional(),
  userId: z.instanceof(Types.ObjectId),
  guardianId: z.string(),
  occupation: z.string().optional(),
  monthlyIncome: z.number().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Staff Schema
export const staffZ = personBaseZ.extend({
  _id: z.instanceof(Types.ObjectId).optional(),
  userId: z.instanceof(Types.ObjectId),
  staffId: z.string(),
  designation: z.string(),
  department: z.string().optional(),
  joinDate: z.coerce.date(),
  basicSalary: z.number().min(0),
  allowances: z.number().min(0).default(0),
  branch: z.nativeEnum(Branch),
  isActive: z.boolean().default(true),
  resignationDate: z.coerce.date().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Class Schema
export const classZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  className: z.string(),
  description: z.string().optional(),
  branch: z.nativeEnum(Branch),
  batchType: z.nativeEnum(BatchType),
  monthlyFee: z.number().min(0),
  capacity: z.number().min(1).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Session Schema
export const sessionZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  sessionName: z.string(),
  batchType: z.nativeEnum(BatchType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Fee Collection Schema
export const feeCollectionZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  receiptNumber: z.string(),
  studentId: z.instanceof(Types.ObjectId),
  sessionId: z.instanceof(Types.ObjectId),
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000),
  feeType: z.nativeEnum(FeeType),
  totalAmount: z.number().min(0),
  discount: z.number().min(0).default(0),
  paidAmount: z.number().min(0),
  dueAmount: z.number().min(0).default(0),
  paymentStatus: z.nativeEnum(PaymentStatus),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.coerce.date().default(() => new Date()),
  paidBy: z.instanceof(Types.ObjectId), // Who paid: student or guardian userId
  paidByRole: z.nativeEnum(UserRole), // Role of payer: student or guardian
  collectedBy: z.instanceof(Types.ObjectId), // Staff who collected
  remarks: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Salary Payment Schema
export const salaryPaymentZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  receiptNumber: z.string(),
  staffId: z.instanceof(Types.ObjectId),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  basicSalary: z.number().min(0),
  allowances: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  advanceAdjustment: z.number().min(0).default(0),
  netSalary: z.number().min(0),
  paymentDate: z.coerce.date().default(() => new Date()),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paidBy: z.instanceof(Types.ObjectId),
  remarks: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Advance Salary Schema
export const advanceSalaryZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  staffId: z.instanceof(Types.ObjectId),
  amount: z.number().min(0),
  requestDate: z.coerce.date().default(() => new Date()),
  approvalDate: z.coerce.date().optional(),
  approvedBy: z.instanceof(Types.ObjectId).optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  status: z.enum(["pending", "approved", "rejected", "paid"]),
  adjustmentPlan: z.string().optional(),
  remarks: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Expense Schema
export const expenseZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  voucherNumber: z.string(),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string(),
  amount: z.number().min(0),
  expenseDate: z.coerce.date().default(() => new Date()),
  paymentMethod: z.nativeEnum(PaymentMethod),
  branch: z.nativeEnum(Branch),
  paidTo: z.string().optional(),
  approvedBy: z.instanceof(Types.ObjectId).optional(),
  remarks: z.string().optional(),
  attachments: z.array(imageZ).optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// TODO referenceId ki? and performedBy ki?
// Transaction Log Schema
export const transactionLogZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  transactionType: z.nativeEnum(TransactionType),
  referenceId: z.instanceof(Types.ObjectId),
  referenceModel: z.enum([
    "FeeCollection",
    "SalaryPayment",
    "Expense",
    "AdvanceSalary",
  ]),
  amount: z.number(),
  description: z.string(),
  performedBy: z.instanceof(Types.ObjectId),
  branch: z.nativeEnum(Branch),
  createdAt: z.coerce.date().default(() => new Date()),
});

// Attendance Schema
export const attendanceZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  studentId: z.instanceof(Types.ObjectId),
  classId: z.instanceof(Types.ObjectId),
  date: z.coerce.date(),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional(),
  markedBy: z.instanceof(Types.ObjectId),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Staff Attendance Schema
export const staffAttendanceZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  staffId: z.instanceof(Types.ObjectId),
  date: z.coerce.date(),
  status: z.nativeEnum(AttendanceStatus),
  checkInTime: z.coerce.date().optional(),
  checkOutTime: z.coerce.date().optional(),
  remarks: z.string().optional(),
  markedBy: z.instanceof(Types.ObjectId),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Exam Schema
export const examZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  examName: z.string(),
  examType: z.nativeEnum(ExamType),
  classId: z.instanceof(Types.ObjectId),
  sessionId: z.instanceof(Types.ObjectId),
  examDate: z.coerce.date(),
  totalMarks: z.number().min(0),
  passingMarks: z.number().min(0),
  subjects: z.array(
    z.object({
      subjectName: z.string(),
      marks: z.number().min(0),
    })
  ),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// TODO. ekhane position keno dorkar?
// Result Schema
export const resultZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  examId: z.instanceof(Types.ObjectId),
  studentId: z.instanceof(Types.ObjectId),
  marks: z.array(
    z.object({
      subjectName: z.string(),
      obtainedMarks: z.number().min(0),
      totalMarks: z.number().min(0),
    })
  ),
  totalMarks: z.number().min(0),
  obtainedMarks: z.number().min(0),
  percentage: z.number().min(0).max(100),
  grade: z.string().optional(),
  position: z.number().optional(),
  remarks: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// TODO. amra book resale kori.
// Book Schema
export const bookZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  bookCode: z.string(),
  title: z.string(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  category: z.string(),
  quantity: z.number().min(0),
  availableQuantity: z.number().min(0),
  status: z.nativeEnum(BookStatus),
  branch: z.nativeEnum(Branch),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});
// Book Issue Schema
export const bookIssueZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  bookId: z.instanceof(Types.ObjectId),
  studentId: z.instanceof(Types.ObjectId),
  issueDate: z.coerce.date().default(() => new Date()),
  expectedReturnDate: z.coerce.date(),
  actualReturnDate: z.coerce.date().optional(),
  status: z.enum(["issued", "returned", "lost"]),
  issuedBy: z.instanceof(Types.ObjectId),
  returnedTo: z.instanceof(Types.ObjectId).optional(),
  fineAmount: z.number().min(0).default(0),
  remarks: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Notice Schema
export const noticeZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  title: z.string(),
  content: z.string(),
  noticeType: z.nativeEnum(NoticeType),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  targetAudience: z.array(z.nativeEnum(UserRole)),
  branch: z.array(z.nativeEnum(Branch)).optional(),
  publishDate: z.coerce.date().default(() => new Date()),
  expiryDate: z.coerce.date().optional(),
  attachments: z.array(imageZ).optional(),
  isActive: z.boolean().default(true),
  createdBy: z.instanceof(Types.ObjectId),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// Blog Schema
export const blogZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  featuredImage: imageZ.optional(),
  authorId: z.instanceof(Types.ObjectId),
  authorRole: z.nativeEnum(UserRole),
  status: z.nativeEnum(BlogStatus),
  tags: z.array(z.string()).optional(),
  views: z.number().default(0),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
});

// SMS Log Schema
export const smsLogZ = z.object({
  _id: z.instanceof(Types.ObjectId).optional(),
  recipientId: z.instanceof(Types.ObjectId),
  recipientRole: z.nativeEnum(UserRole),
  phoneNumber: z
    .string()
    .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
    .trim(),
  message: z.string(),
  purpose: z.enum([
    "fee_due",
    "fee_paid",
    "attendance",
    "notice",
    "exam",
    "other",
  ]),
  status: z.enum(["pending", "sent", "failed"]),
  sentAt: z.coerce.date().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
});

export const loginZ = z
  .object({
    email: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().email("Invalid email address").trim().toLowerCase().optional()
    ),

    phone: z
      .string()
      .regex(BDPhoneRegex, "Invalid BD phone number (e.g. 019XXXXXXXX)")
      .trim()
      .optional(),
    password: z.string().min(8).max(20),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"], // Can also use "phone" or leave empty
  });

//  Validate the ID (MongoDB ObjectId format)
export const mongoIdZ = z.object({
  _id: z
    .any()
    .transform((val) =>
      val instanceof mongoose.Types.ObjectId ? val.toString() : val
    )
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid MongoDB User ID format",
    }),
});

// ==================== TYPESCRIPT TYPES/INTERFACES ====================

export type TMongoId = z.infer<typeof mongoIdZ>;
export type TLogin = z.infer<typeof loginZ>;
export type TChangePassword = z.infer<typeof changePasswordZ>;
export type IUser = z.infer<typeof userZ> & {
  matchPassword: (password: string) => Promise<boolean>;
  generateResetPasswordToken: (expMinutes?: number) => string;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  refreshTokens: string[];
  password: string;
};
export type IUpdateUser = z.infer<typeof userUpdateZ>;
export type IStudent = z.infer<typeof studentZ>;
export type IGuardian = z.infer<typeof guardianZ>;
export type IStaff = z.infer<typeof staffZ>;
export type IClass = z.infer<typeof classZ>;
export type ISession = z.infer<typeof sessionZ>;
export type IFeeCollection = z.infer<typeof feeCollectionZ>;
export type ISalaryPayment = z.infer<typeof salaryPaymentZ>;
export type IAdvanceSalary = z.infer<typeof advanceSalaryZ>;
export type IExpense = z.infer<typeof expenseZ>;
export type ITransactionLog = z.infer<typeof transactionLogZ>;
export type IAttendance = z.infer<typeof attendanceZ>;
export type IStaffAttendance = z.infer<typeof staffAttendanceZ>;
export type IExam = z.infer<typeof examZ>;
export type IResult = z.infer<typeof resultZ>;
export type IBook = z.infer<typeof bookZ>;
export type IBookIssue = z.infer<typeof bookIssueZ>;
export type INotice = z.infer<typeof noticeZ>;
export type IBlog = z.infer<typeof blogZ>;
export type IImage = z.infer<typeof imageZ>;
export type ISMSLog = z.infer<typeof smsLogZ>;

// Commons
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}
// ==================== MONGODB SCHEMAS & MODELS ====================

// Book Model
const BookSchema = new Schema<IBook & Document>(
  {
    bookCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String },
    publisher: { type: String },
    edition: { type: String },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(BookStatus),
      default: BookStatus.AVAILABLE,
    },
    branch: { type: String, enum: Object.values(Branch), required: true },
  },
  { timestamps: true }
);

// BookSchema.index({ bookCode: 1 });
// BookSchema.index({ branch: 1, status: 1 });

export const Book: Model<IBook & Document> =
  mongoose.models.Book || mongoose.model<IBook & Document>("Book", BookSchema);

// Book Issue Model
const BookIssueSchema = new Schema<IBookIssue & Document>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    issueDate: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: { type: Date },
    status: {
      type: String,
      enum: ["issued", "returned", "lost"],
      default: "issued",
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    returnedTo: { type: Schema.Types.ObjectId, ref: "User" },
    fineAmount: { type: Number, default: 0, min: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

BookIssueSchema.index({ bookId: 1, status: 1 });
BookIssueSchema.index({ studentId: 1, status: 1 });

export const BookIssue: Model<IBookIssue & Document> =
  mongoose.models.BookIssue ||
  mongoose.model<IBookIssue & Document>("BookIssue", BookIssueSchema);

// TODO explore kora hoy ni.
// SMS Log Model
const SMSLogSchema = new Schema<ISMSLog & Document>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["fee_due", "fee_paid", "attendance", "notice", "exam", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

SMSLogSchema.index({ recipientId: 1, createdAt: -1 });
SMSLogSchema.index({ status: 1 });

export const SMSLog: Model<ISMSLog & Document> =
  mongoose.models.SMSLog ||
  mongoose.model<ISMSLog & Document>("SMSLog", SMSLogSchema);
