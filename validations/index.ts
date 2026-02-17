import mongoose, { Document, Model, Schema } from "mongoose";
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
  NON = "NON", // for those who don't want to disclose
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
  ADMISSION = "admissionFee",
  MONTHLY = "monthlyFee",
  COACHING = "coachingFee",
  DAYCARE = "daycareFee",
  RESIDENTIAL = "residentialFee",
  MEAL = "mealFee",
  UTILITY = "utilityFee",
  OTHER = "otherFee",
}

export enum PaymentSource {
  SELF = "self",
  OFFICE = "office",
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
  REVERSAL = "reversal",
  ADJUSTMENT = "adjustment",
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
  AVAIlabel = "availabel",
  ISSUED = "issued",
  LOST = "lost",
  DAMAGED = "damaged",
}

export enum NoticeType {
  GENERAL = "general",
  ACADEMIC = "academic",
  URGENT = "urgent",
  EVENT = "event",
  HOLIDAY = "holiday",
  EXAM = "exam",
  ADMISSION = "admission",
  RESULT = "result",
}

export enum NoticePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NoticeAudience {
  ALL = "all",
  STUDENTS = "student",
  STAFF = "staff",
  GUARDIANS = "guardians",
  SPECIFIC_CLASS = "specific_class",
  SPECIFIC_BRANCH = "specific_branch",
}

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// ==================== ZOD SCHEMAS ====================

// Bangladesh phone regex (local format like 017xxxxxxxx)
export const BDPhoneRegex = /^01[3-9]\d{8}$/;

export const addressZ = z.object({
  village: z.string().trim().min(1, "Village is required"),
  postOffice: z.string().trim().min(1, "Post office is required"),
  upazila: z.string().trim().min(1, "Upazila is required"),
  district: z.string().trim().min(1, "District is required"),
  division: z.string().trim().optional(),
});

const moneyZ = z.coerce.number().min(0);

// Image validation
export const imageZ = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
});

export const mongoZ = z
  .any()
  .transform((val) =>
    val instanceof mongoose.Types.ObjectId ? val.toString() : val,
  )
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB User ID format",
  });

// User Schema
export const userZ = z.object({
  _id: mongoZ.optional(),
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
  profile: mongoZ.optional(),
  profileModel: z.enum(["Student", "Staff", "Guardian"]).optional(),
  isActive: z.boolean().optional(),
  lastLogin: z.coerce.date().optional(),
  refreshTokens: z.array(z.string()).optional(),
  passwordResetToken: z.string().nullable().optional(),
  ResetTokenExpires: z.coerce.date().optional(),

  isBlocked: z.boolean().optional(),
  blockedAt: z.coerce.date().optional(),

  isDeleted: z.boolean().optional(),
  deletedAt: z.coerce.date().optional(),

  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// If you want a separate update  where fields can be optional:
export const userUpdateZ = userZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
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
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  nid: z
    .string()
    .refine((val) => /^\d{10}$|^\d{17}$/.test(val), {
      message: "NID must be either 10 or 17 digits",
    })
    .trim()
    .optional(),
  birthCertificateNumber: z
    .string()
    .refine((val) => /^\d{17}$/.test(val), {
      message: "Birth certificate number must be 17 digits",
    })
    .optional(),
  presentAddress: addressZ,
  permanentAddress: z
    .object({
      village: z.string().trim().optional(),
      postOffice: z.string().trim().optional(),
      upazila: z.string().trim().optional(),
      district: z.string().trim().optional(),
      division: z.string().trim().optional(),
    })
    .optional(),
  avatar: imageZ.optional(),
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
});

// Student Schema
export const studentZ = personBaseZ
  .extend({
    _id: mongoZ.optional(),
    userId: mongoZ,
    studentId: z.string().optional(),
    guardianId: mongoZ,
    currentSessionId: mongoZ,
    sessionHistory: z
      .array(
        z.object({
          sessionId: mongoZ,
          classId: mongoZ,
          enrollmentDate: z.coerce.date(),
          completionDate: z.coerce.date().nullable(),
          status: z
            .enum(["ongoing", "completed", "dropped"])
            .default("ongoing"),
        }),
      )
      .optional(),
    guardianRelation: z
      .string()
      .transform((val) => val.trim().toLowerCase())
      .refine(
        (val) =>
          Object.values(GuardianRelation)
            .map((v) => v.toLowerCase())
            .includes(val),
        {
          message: "Invalid guardian relation",
        },
      )
      .transform((val) => {
        const entry = Object.values(GuardianRelation).find(
          (v) => v.toLowerCase() === val,
        );
        return entry as GuardianRelation;
      }),
    classId: mongoZ,
    branch: z.nativeEnum(Branch),
    batchType: z.nativeEnum(BatchType),

    isResidential: z.boolean().default(false),
    isMealIncluded: z.boolean().default(false),

    admissionDate: z.coerce.date(),

    admissionFee: moneyZ.min(0),
    receivedAmount: moneyZ.min(0),

    monthlyFee: moneyZ.min(0),
    residentialFee: moneyZ.min(0).optional(),
    mealFee: moneyZ.min(0).optional(),
    daycareFee: moneyZ.min(0).optional(),
    coachingFee: moneyZ.min(0).optional(),

    feeBalance: z
      .object({
        monthlyFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
        residentialFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
        mealFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
        coachingFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
        daycareFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
        admissionFee: z.object({
          due: moneyZ.min(0).default(0),
          advance: moneyZ.min(0).default(0),
        }),
      })
      .optional(),

    passoutDate: z.coerce.date().optional(),
    avatar: z.string().optional(),

    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentSource: z.nativeEnum(PaymentSource),
    remarks: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isMealIncluded && !data.mealFee) {
      ctx.addIssue({
        path: ["mealFee"],
        message: "Meal fee is required for including meal",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.isResidential && !data.residentialFee) {
      ctx.addIssue({
        path: ["residentialFee"],
        message: "Residential fee is required for including residential",
        code: z.ZodIssueCode.custom,
      });
    }
  });

// If you want a separate update  where fields can be optional:
export const studentUpdateZ = studentZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Guardian Schema
export const guardianZ = personBaseZ.omit({ dateOfBirth: true }).extend({
  _id: mongoZ.optional(),
  userId: mongoZ,
  guardianId: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: moneyZ.optional(),
  isActive: z.boolean().optional(),
});

// If you want a separate update  where fields can be optional:
export const guardianUpdateZ = guardianZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Staff Schema
export const staffZ = personBaseZ.extend({
  _id: mongoZ.optional(),
  userId: mongoZ,
  staffId: z.string().optional(),
  designation: z.string(),
  department: z.string().optional(),
  joinDate: z.coerce.date(),
  basicSalary: moneyZ.min(0),
  branch: z.nativeEnum(Branch),
  resignationDate: z.coerce.date().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});

// If you want a separate update  where fields can be optional:
export const staffUpdateZ = staffZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Class Schema
export const classZ = z.object({
  _id: mongoZ.optional(),
  className: z.string().min(3),
  description: z.string().optional(),
  monthlyFee: moneyZ.min(0),
  capacity: moneyZ.min(1).optional(),
  isActive: z.boolean().optional(),
});

// If you want a separate update  where fields can be optional:
export const classUpdateZ = classZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Session Schema
export const sessionZ = z.object({
  _id: mongoZ.optional(),
  sessionName: z.string(),
  batchType: z.nativeEnum(BatchType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().default(true),
});

// If you want a separate update  where fields can be optional:
export const sessionUpdateZ = sessionZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Fee Collection Schema
export const feeCollectionZ = z
  .object({
    _id: mongoZ.optional(),
    receiptNumber: z.string().optional(),
    studentId: mongoZ,
    sessionId: mongoZ.optional(),
    branch: z.nativeEnum(Branch).optional(),

    feeType: z.nativeEnum(FeeType),
    month: moneyZ.min(0).max(11).optional(),
    year: moneyZ.min(2000).optional(),

    payableAmount: moneyZ.min(0).optional(),
    receivedAmount: moneyZ.min(0).default(0),
    baseAmount: moneyZ.min(0).optional(),

    dueAmount: moneyZ.min(0).default(0),
    advanceAmount: moneyZ.min(0).default(0),

    paymentStatus: z.nativeEnum(PaymentStatus).optional(),

    paymentSource: z.nativeEnum(PaymentSource),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentDate: z.coerce.date().default(() => new Date()),

    collectedBy: mongoZ.optional(), // Staff who collected
    updatedBy: mongoZ.optional(), // Staff who collected

    isDeleted: z.boolean().optional(),
    deletedAt: z.coerce.date().optional(),

    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const monthlyFees = [
      FeeType.MONTHLY,
      FeeType.COACHING,
      FeeType.DAYCARE,
      FeeType.MEAL,
    ];

    if (monthlyFees.includes(data.feeType)) {
      if (!data.month) {
        ctx.addIssue({
          path: ["month"],
          message: "Month is required for monthly type fees",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.year) {
        ctx.addIssue({
          path: ["year"],
          message: "Year is required for monthly type fees",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if ([FeeType.UTILITY, FeeType.OTHER].includes(data.feeType)) {
      if (!data.payableAmount || data.payableAmount <= 0) {
        ctx.addIssue({
          path: ["payableAmount"],
          message: "Payable amount is required for this fee type",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

// If you want a separate update  where fields can be optional:
export const feeCollectionsUpdateZ = feeCollectionZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

export const payAdmissionDueZ = z.object({
  studentId: mongoZ,
  receivedAmount: moneyZ,
});

// Salary Payment Schema
export const salaryPaymentZ = z.object({
  _id: mongoZ.optional(),
  receiptNumber: z.string().optional(),
  staffId: mongoZ,
  month: moneyZ.min(0).max(11),
  year: moneyZ.min(2000),
  basicSalary: moneyZ.min(0),
  bonus: moneyZ.min(0).default(0),
  netSalary: moneyZ.optional(),
  paymentDate: z.coerce.date().default(() => new Date()),
  paymentMethod: z.nativeEnum(PaymentMethod),
  branch: z.nativeEnum(Branch),
  paidBy: mongoZ.optional(),
  remarks: z.string().optional(),
  status: z.enum(["paid", "reversed", "adjusted"]).optional(),
  isDeleted: z.boolean().optional(),
  deletedAt: z.coerce.date().optional(),
});

// If you want a separate update  where fields can be optional:
export const salaryPaymentUpdateZ = salaryPaymentZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Expense Schema
export const expenseZ = z.object({
  _id: mongoZ.optional(),
  voucherNumber: z.string(),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string(),
  amount: moneyZ.min(0),
  expenseDate: z.coerce.date().default(() => new Date()),
  paymentMethod: z.nativeEnum(PaymentMethod),
  branch: z.nativeEnum(Branch),
  paidTo: z.string().optional(),
  approvedBy: mongoZ.optional(),
  remarks: z.string().optional(),
  attachments: z.array(imageZ).optional(),
});

// If you want a separate update  where fields can be optional:
export const expenseUpdateZ = expenseZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// Transaction Log Schema
export const transactionLogZ = z.object({
  transactionType: z.nativeEnum(TransactionType),
  referenceId: mongoZ,
  referenceModel: z.enum(["FeeCollection", "SalaryPayment", "Expense"]),
  amount: moneyZ,
  description: z.string(),
  performedBy: mongoZ.optional(),
  branch: z.nativeEnum(Branch),
  isDeleted: z.boolean().optional(),
  deletedAt: z.coerce.date().optional(),
});

// Attendance Schema
export const attendanceZ = z.object({
  _id: mongoZ.optional(),
  studentId: mongoZ,
  classId: mongoZ,
  date: z.coerce.date(),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional(),
  sessionId: mongoZ,
  markedBy: mongoZ,
});

// Staff Attendance Schema
export const staffAttendanceZ = z.object({
  _id: mongoZ.optional(),
  staffId: mongoZ,
  date: z.coerce.date(),
  status: z.nativeEnum(AttendanceStatus),
  checkInTime: z.coerce.date().optional(),
  checkOutTime: z.coerce.date().optional(),
  remarks: z.string().optional(),
  markedBy: mongoZ,
});

// Exam Schema
export const examZ = z.object({
  _id: mongoZ.optional(),
  examName: z.string(),
  examType: z.nativeEnum(ExamType),
  classId: mongoZ,
  sessionId: mongoZ,
  examDate: z.coerce.date(),
  totalMarks: moneyZ.min(0),
  passingMarks: moneyZ.min(0),
  subjects: z.array(
    z.object({
      subjectName: z.string(),
      marks: moneyZ.min(0),
    }),
  ),
});

// Result Schema
export const resultZ = z.object({
  _id: mongoZ.optional(),
  examId: mongoZ,
  studentId: mongoZ,
  sessionId: mongoZ,
  marks: z.array(
    z.object({
      subjectName: z.string(),
      obtainedMarks: moneyZ.min(0),
      totalMarks: moneyZ.min(0),
    }),
  ),
  totalMarks: moneyZ.min(0),
  obtainedMarks: moneyZ.min(0),
  percentage: moneyZ.min(0).max(100),
  grade: z.string().optional(),
  position: moneyZ.optional(),
  remarks: z.string().optional(),
});

// TODO. amra book resale kori.
// Book Schema
export const bookZ = z.object({
  _id: mongoZ.optional(),
  bookCode: z.string(),
  title: z.string(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  category: z.string(),
  quantity: moneyZ.min(0),
  availabelQuantity: moneyZ.min(0),
  status: z.nativeEnum(BookStatus),
  branch: z.nativeEnum(Branch),
});

// Book Issue Schema
export const bookIssueZ = z.object({
  _id: mongoZ.optional(),
  bookId: mongoZ,
  studentId: mongoZ,
  issueDate: z.coerce.date().default(() => new Date()),
  expectedReturnDate: z.coerce.date(),
  actualReturnDate: z.coerce.date().optional(),
  status: z.enum(["issued", "returned", "lost"]),
  issuedBy: mongoZ,
  returnedTo: mongoZ.optional(),
  fineAmount: moneyZ.default(0),
  remarks: z.string().optional(),
});

// Notice Schema
export const noticeZ = z.object({
  title: z.string(),
  content: z.string(),
  publisherName: z.string().optional(),
  publisherRole: z.string().optional(),
  publisherAvatar: imageZ.optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      }),
    )
    .optional(),
  type: z.nativeEnum(NoticeType),
  audience: z.nativeEnum(NoticeAudience).optional(),
  priority: z.nativeEnum(NoticePriority).optional(),
  targetClasses: z.array(z.string()).optional(),
  targetBranches: z.array(z.string()).optional(),
  publishedBy: mongoZ.optional(),
  expiryDate: z.coerce.date().optional(),
  images: z.array(imageZ).optional(),
  isActive: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

// Blog Schema
export const blogZ = z.object({
  _id: mongoZ.optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  featuredImage: imageZ.optional(),
  authorId: mongoZ.optional(),
  publishedBy: mongoZ.optional(),
  status: z.nativeEnum(BlogStatus).optional(),
  tags: z.array(z.string()).optional(),
  views: moneyZ.default(0),
  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

// If you want a separate update  where fields can be optional:
export const blogUpdateZ = blogZ.partial().refine(
  (data) => {
    // ensure at least one field present on update
    return Object.keys(data).length > 0;
  },
  { message: "At least one field must be provided for update" },
);

// SMS Log Schema
export const smsLogZ = z.object({
  _id: mongoZ.optional(),
  recipientId: mongoZ,
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
      z.string().email("Invalid email address").trim().toLowerCase().optional(),
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
  _id: mongoZ,
});

export const passwordResetZ = z.object({
  password: z.string().min(8).max(20),
});

export const resetTokenZ = z.object({
  resetToken: z.string().length(64, "Invalid reset token format"),
});

// ==================== TYPESCRIPT TYPES/INTERFACES ====================

export type TMongoId = z.infer<typeof mongoZ>;
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
export type IUpdateStudent = z.infer<typeof studentUpdateZ>;
export type IGuardian = z.infer<typeof guardianZ>;
export type IUpdateGuardian = z.infer<typeof guardianUpdateZ>;
export type IStaff = z.infer<typeof staffZ>;
export type IUpdateStaff = z.infer<typeof staffUpdateZ>;
export type IClass = z.infer<typeof classZ>;
export type IUpdateClass = z.infer<typeof classUpdateZ>;
export type ISession = z.infer<typeof sessionZ>;
export type IUpdateSession = z.infer<typeof sessionUpdateZ>;
export type IFeeCollection = z.infer<typeof feeCollectionZ>;
export type IPayAdmissionDue = z.infer<typeof payAdmissionDueZ>;
export type IFeeCollectionUpdate = z.infer<typeof feeCollectionsUpdateZ>;
export type ISalaryPayment = z.infer<typeof salaryPaymentZ>;
export type ISalaryPaymentUpdate = z.infer<typeof salaryPaymentUpdateZ>;
export type IExpense = z.infer<typeof expenseZ>;
export type IExpenseUpdate = z.infer<typeof expenseUpdateZ>;
export type ITransactionLog = z.infer<typeof transactionLogZ>;
export type IAttendance = z.infer<typeof attendanceZ>;
export type IStaffAttendance = z.infer<typeof staffAttendanceZ>;
export type IExam = z.infer<typeof examZ>;
export type IResult = z.infer<typeof resultZ>;
export type IBook = z.infer<typeof bookZ>;
export type IBookIssue = z.infer<typeof bookIssueZ>;
export type INotice = z.infer<typeof noticeZ>;
export type IBlog = z.infer<typeof blogZ>;
export type IBlogUpdate = z.infer<typeof blogUpdateZ>;
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

// Monthly recurring + balance tracked
export const monthlyFees: FeeType[] = [
  FeeType.MONTHLY,
  FeeType.COACHING,
  FeeType.DAYCARE,
  FeeType.MEAL,
  FeeType.RESIDENTIAL,
];
// ==================== MONGODB SCHEMAS & MODELS ====================

// Book Model
// const BookSchema = new Schema<IBook & Document>(
//   {
//     bookCode: { type: String, required: true, unique: true },
//     title: { type: String, required: true },
//     author: { type: String },
//     publisher: { type: String },
//     edition: { type: String },
//     category: { type: String, required: true },
//     quantity: { type: Number, required: true, min: 0 },
//     availabelQuantity: { type: Number, required: true, min: 0 },
//     status: {
//       type: String,
//       enum: Object.values(BookStatus),
//       default: BookStatus.AVAIlabel,
//     },
//     branch: { type: String, enum: Object.values(Branch), required: true },
//   },
//   { timestamps: true }
// );

// BookSchema.index({ bookCode: 1 });
// BookSchema.index({ branch: 1, status: 1 });

// export const Book: Model<IBook & Document> =
//   mongoose.models.Book || mongoose.model<IBook & Document>("Book", BookSchema);

// Book Issue Model
// const BookIssueSchema = new Schema<IBookIssue & Document>(
//   {
//     bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
//     studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
//     issueDate: { type: Date, default: Date.now },
//     expectedReturnDate: { type: Date, required: true },
//     actualReturnDate: { type: Date },
//     status: {
//       type: String,
//       enum: ["issued", "returned", "lost"],
//       default: "issued",
//     },
//     issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     returnedTo: { type: Schema.Types.ObjectId, ref: "User" },
//     fineAmount: { type: Number, default: 0, min: 0 },
//     remarks: { type: String },
//   },
//   { timestamps: true }
// );

// BookIssueSchema.index({ bookId: 1, status: 1 });
// BookIssueSchema.index({ studentId: 1, status: 1 });

// export const BookIssue: Model<IBookIssue & Document> =
//   mongoose.models.BookIssue ||
//   mongoose.model<IBookIssue & Document>("BookIssue", BookIssueSchema);

// TODO explore kora hoy ni.
// SMS Log Model
// const SMSLogSchema = new Schema<ISMSLog & Document>(
//   {
//     recipientId: { type: Schema.Types.ObjectId, required: true },
//     recipientRole: {
//       type: String,
//       enum: Object.values(UserRole),
//       required: true,
//     },
//     phoneNumber: { type: String, required: true },
//     message: { type: String, required: true },
//     purpose: {
//       type: String,
//       enum: ["fee_due", "fee_paid", "attendance", "notice", "exam", "other"],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "sent", "failed"],
//       default: "pending",
//     },
//     sentAt: { type: Date },
//     errorMessage: { type: String },
//   },
//   { timestamps: true }
// );

// SMSLogSchema.index({ recipientId: 1, createdAt: -1 });
// SMSLogSchema.index({ status: 1 });

// export const SMSLog: Model<ISMSLog & Document> =
//   mongoose.models.SMSLog ||
//   mongoose.model<ISMSLog & Document>("SMSLog", SMSLogSchema);

// ==================== ZOD SCHEMAS FOR FRONTEND ====================

export const signInZ = z.object({
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

export type ISignIn = z.infer<typeof signInZ>;

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

export type IResetPassword = z.infer<typeof resetPasswordZ>;

export const forgotPasswordZ = z.object({
  email: z.string().email(),
});

export type IForgotPassowrd = z.infer<typeof forgotPasswordZ>;
