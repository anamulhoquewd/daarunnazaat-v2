import mongoose from "mongoose";
import z from "zod";
import { Student } from "./schema";
import { Enrollment } from "@/modules/enrollment/schema";
import { Invoice } from "@/modules/invoice/schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { InvoiceStatus } from "@/validations";
import { schemaValidationError } from "@/server/error/index";
import { moneyInputSchema, optionalMoneyInputSchema } from "@/lib/money";
import {
  Branch,
  Gender,
  BloodGroup,
  EnrollmentStatus,
  mongoIdStringZ as mongoIdZ,
  addressSchema,
  partialAddressSchema,
} from "@/validations";
import pagination from "@/server/utils/pagination";


// ── Validation schemas ─────────────────────────────────────────────────────────

export const createStudentZ = z.object({
  fullName: z.string().min(1).trim(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  photo: z.string().url().optional(),
  branch: z.nativeEnum(Branch),
  classId: mongoIdZ,
  currentSessionId: mongoIdZ,
  guardianId: mongoIdZ,
  admissionDate: z.coerce.date().optional(),
  address: addressSchema,
  permanentAddress: partialAddressSchema.optional(),
  admissionFee: moneyInputSchema,
  monthlyFee: moneyInputSchema,
  isResidential: z.boolean().default(false),
  residentialFee: z.preprocess((v) => v ?? 0, moneyInputSchema),
  isMealIncluded: z.boolean().default(false),
  mealFee: z.preprocess((v) => v ?? 0, moneyInputSchema),
  needsCoaching: z.boolean().default(false),
  coachingFee: z.preprocess((v) => v ?? 0, moneyInputSchema),
  isDaycare: z.boolean().default(false),
  daycareFee: z.preprocess((v) => v ?? 0, moneyInputSchema),
});

export const updateStudentZ = z.object({
  fullName: z.string().min(1).trim().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender).optional(),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  photo: z.string().url().optional(),
  branch: z.nativeEnum(Branch).optional(),
  classId: mongoIdZ.optional(),
  currentSessionId: mongoIdZ.optional(),
  guardianId: mongoIdZ.optional(),
  address: addressSchema.optional(),
  permanentAddress: partialAddressSchema.optional(),
  admissionFee: optionalMoneyInputSchema,
  monthlyFee: optionalMoneyInputSchema,
  isResidential: z.boolean().optional(),
  residentialFee: optionalMoneyInputSchema,
  isMealIncluded: z.boolean().optional(),
  mealFee: optionalMoneyInputSchema,
  needsCoaching: z.boolean().optional(),
  coachingFee: optionalMoneyInputSchema,
  isDaycare: z.boolean().optional(),
  daycareFee: optionalMoneyInputSchema,
  isActive: z.boolean().optional(),
});

export const listStudentsQueryZ = z.object({
  branch: z.nativeEnum(Branch).optional(),
  classId: mongoIdZ.optional(),
  sessionId: mongoIdZ.optional(),
  guardianId: mongoIdZ.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export type ICreateStudent = z.infer<typeof createStudentZ>;
export type IUpdateStudent = z.infer<typeof updateStudentZ>;

// ── Shared helper ──────────────────────────────────────────────────────────────

async function withStudent(
  id: string,
  fn: (doc: any) => Promise<{ success: any } | { error: any }>,
) {
  try {
    const doc = await Student.findById(id);
    if (!doc) return { error: { message: "Student not found" } };
    return await fn(doc);
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
}

// ── CRUD services ──────────────────────────────────────────────────────────────

export const createStudent = async ({
  body,
  userId,
}: {
  body: ICreateStudent;
  userId: string;
}) => {
  const parsed = createStudentZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid student data") };
  const data = parsed.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const studentId = await nextNumber("DN-STU");

    const [student] = await Student.create(
      [
        {
          studentId,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          photo: data.photo,
          branch: data.branch,
          classId: new mongoose.Types.ObjectId(data.classId),
          currentSessionId: new mongoose.Types.ObjectId(data.currentSessionId),
          guardianId: new mongoose.Types.ObjectId(data.guardianId),
          admissionDate: data.admissionDate ?? now,
          address: data.address,
          permanentAddress: data.permanentAddress,
          admissionFee: data.admissionFee,
          monthlyFee: data.monthlyFee,
          isResidential: data.isResidential,
          residentialFee: data.residentialFee,
          isMealIncluded: data.isMealIncluded,
          mealFee: data.mealFee,
          needsCoaching: data.needsCoaching,
          coachingFee: data.coachingFee,
          isDaycare: data.isDaycare,
          daycareFee: data.daycareFee,
          creditBalance: 0,
          isActive: true,
          isDeleted: false,
          createdBy: new mongoose.Types.ObjectId(userId),
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      ],
      { session },
    );

    await Enrollment.create(
      [
        {
          studentId: student._id,
          sessionId: new mongoose.Types.ObjectId(data.currentSessionId),
          classId: new mongoose.Types.ObjectId(data.classId),
          branch: data.branch,
          enrollmentDate: data.admissionDate ?? now,
          status: EnrollmentStatus.ONGOING,
          isDeleted: false,
          createdBy: new mongoose.Types.ObjectId(userId),
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      ],
      { session },
    );

    if (data.admissionFee > 0) {
      const invoiceNumber = await nextNumber("DN-INV");
      await Invoice.create(
        [
          {
            invoiceNumber,
            studentId: student._id,
            sessionId: new mongoose.Types.ObjectId(data.currentSessionId),
            branch: data.branch,
            invoiceType: "admission",
            periodYear: null,
            periodMonth: null,
            lineItems: [
              {
                feeType: "admissionFee",
                label: "Admission Fee",
                amount: data.admissionFee,
                discount: 0,
                net: data.admissionFee,
              },
            ],
            subtotal: data.admissionFee,
            totalDiscount: 0,
            netPayable: data.admissionFee,
            adjustmentAmount: 0,
            paidAmount: 0,
            dueAmount: data.admissionFee,
            status: InvoiceStatus.UNPAID,
            isLocked: false,
            isDeleted: false,
            createdBy: new mongoose.Types.ObjectId(userId),
            updatedBy: new mongoose.Types.ObjectId(userId),
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    return { success: student };
  } catch (err: any) {
    await session.abortTransaction();
    if (err.code === 11000) return { error: { message: "Duplicate student ID — please retry" } };
    return { serverError: { message: err.message } };
  } finally {
    session.endSession();
  }
};

export const listStudents = async (rawQuery: Record<string, unknown>) => {
  const parsed = listStudentsQueryZ.safeParse(rawQuery);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid query") };
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.branch)    filter.branch    = q.branch;
    if (q.classId)   filter.classId   = q.classId;
    if (q.sessionId) filter.currentSessionId = q.sessionId;
    if (q.guardianId) filter.guardianId = q.guardianId;
    if (q.isActive !== undefined) filter.isActive = q.isActive;
    if (q.search) filter.fullName = { $regex: q.search, $options: "i" };

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      Student.find(filter)
        .populate("classId", "name order")
        .populate("currentSessionId", "name cycleType")
        .populate("guardianId", "fullName phone")
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(q.limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return {
      success: { data, pagination: pagination({ page: q.page, limit: q.limit, total }) },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getStudent = async (id: string) => {
  try {
    const doc = await Student.findById(id)
      .populate("classId", "name order")
      .populate("currentSessionId", "name cycleType startDate endDate")
      .populate("guardianId", "fullName phone guardianId")
      .lean();
    if (!doc || (doc as any).isDeleted) return { error: { message: "Student not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateStudent = async ({
  id,
  body,
  userId,
}: {
  id: string;
  body: IUpdateStudent;
  userId: string;
}) => {
  const parsed = updateStudentZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid update data") };

  try {
    const $set: any = { ...parsed.data, updatedBy: new mongoose.Types.ObjectId(userId) };
    if ($set.classId)          $set.classId          = new mongoose.Types.ObjectId($set.classId);
    if ($set.currentSessionId) $set.currentSessionId = new mongoose.Types.ObjectId($set.currentSessionId);
    if ($set.guardianId)       $set.guardianId       = new mongoose.Types.ObjectId($set.guardianId);

    const doc = await Student.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Student not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

// ── Status mutations ───────────────────────────────────────────────────────────

export const activate = (id: string) =>
  withStudent(id, async (doc) => {
    if (doc.isActive) return { error: { message: "Student is already active" } };
    doc.isActive = true;
    await doc.save();
    return { success: { message: "Student activated successfully" } };
  });

export const deactivate = (id: string) =>
  withStudent(id, async (doc) => {
    if (!doc.isActive) return { error: { message: "Student is already inactive" } };
    doc.isActive = false;
    await doc.save();
    return { success: { message: "Student deactivated successfully" } };
  });

export const block = (id: string) =>
  withStudent(id, async (doc) => {
    if (doc.isBlocked) return { error: { message: "Student is already blocked" } };
    doc.isBlocked = true;
    doc.blockedAt = new Date();
    await doc.save();
    return { success: { message: "Student blocked successfully" } };
  });

export const unblock = (id: string) =>
  withStudent(id, async (doc) => {
    if (!doc.isBlocked) return { error: { message: "Student is not blocked" } };
    doc.isBlocked = false;
    doc.blockedAt = null;
    await doc.save();
    return { success: { message: "Student unblocked successfully" } };
  });

export const softDelete = (id: string) =>
  withStudent(id, async (doc) => {
    if (doc.isDeleted) return { error: { message: "Student is already deleted" } };
    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();
    return { success: { message: "Student deleted successfully" } };
  });

export const restore = (id: string) =>
  withStudent(id, async (doc) => {
    if (!doc.isDeleted) return { error: { message: "Student is not deleted" } };
    doc.isDeleted = false;
    doc.deletedAt = null;
    await doc.save();
    return { success: { message: "Student restored successfully" } };
  });

export const deleteStudent = async (id: string) => {
  try {
    const doc = await Student.findByIdAndDelete(id);
    if (!doc) return { error: { message: "Student not found" } };
    return { success: { message: "Student permanently deleted" } };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};
