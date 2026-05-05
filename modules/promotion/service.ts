import mongoose from "mongoose";
import z from "zod";
import { Student } from "@/modules/student/schema";
import { Enrollment } from "@/modules/enrollment/schema";
import { Invoice } from "@/modules/invoice/schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { schemaValidationError } from "@/server/error/index";
import { EnrollmentStatus, InvoiceStatus } from "@/validations";

const promoteStudentZ = z.object({
  studentId: z.string().min(1),
  toClassId: z.string().min(1),
  toSessionId: z.string().min(1),
  action: z.enum(["promoted", "repeated", "graduated", "dropped"]),
  note: z.string().optional(),
  generateAdmissionInvoice: z.boolean().default(false),
});

const bulkPromoteZ = z.object({
  fromSessionId: z.string().min(1),
  fromClassId: z.string().min(1),
  toClassId: z.string().min(1),
  toSessionId: z.string().min(1),
  studentIds: z.array(z.string().min(1)).min(1),
  action: z.enum(["promoted", "repeated", "graduated", "dropped"]).default("promoted"),
  generateAdmissionInvoice: z.boolean().default(false),
});

export type IPromoteStudent = z.infer<typeof promoteStudentZ>;
export type IBulkPromote = z.infer<typeof bulkPromoteZ>;

async function promoteOne(
  studentId: string,
  toClassId: string,
  toSessionId: string,
  action: string,
  note: string | undefined,
  generateAdmissionInvoice: boolean,
  userId: string,
  session: mongoose.ClientSession,
): Promise<{ success?: any; error?: { message: string } }> {
  const student = await Student.findById(studentId).session(session);
  if (!student || student.isDeleted) {
    return { error: { message: `Student ${studentId} not found` } };
  }

  // Close the current ONGOING enrollment
  await Enrollment.findOneAndUpdate(
    {
      studentId: student._id,
      sessionId: student.currentSessionId,
      status: EnrollmentStatus.ONGOING,
      isDeleted: false,
    },
    {
      $set: {
        status: action as EnrollmentStatus,
        completionDate: new Date(),
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    { session },
  );

  // If graduated or dropped, deactivate student — no new enrollment
  if (action === "graduated" || action === "dropped") {
    await Student.findByIdAndUpdate(
      student._id,
      {
        $set: {
          isActive: false,
          passoutDate: new Date(),
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { session },
    );
    return { success: { studentId, action } };
  }

  // For promoted / repeated — create new enrollment in target session+class
  const newEnrollment = await Enrollment.create(
    [
      {
        studentId: student._id,
        sessionId: new mongoose.Types.ObjectId(toSessionId),
        classId: new mongoose.Types.ObjectId(toClassId),
        branch: student.branch,
        enrollmentDate: new Date(),
        completionDate: null,
        status: EnrollmentStatus.ONGOING,
        ...(action === "promoted"
          ? {
              promotionMeta: {
                fromClassId: student.classId,
                toClassId: new mongoose.Types.ObjectId(toClassId),
                promotedAt: new Date(),
                promotedBy: new mongoose.Types.ObjectId(userId),
              },
            }
          : {}),
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deleteReason: null,
        createdBy: new mongoose.Types.ObjectId(userId),
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
    ],
    { session },
  );

  // Update student to new class + session
  await Student.findByIdAndUpdate(
    student._id,
    {
      $set: {
        classId: new mongoose.Types.ObjectId(toClassId),
        currentSessionId: new mongoose.Types.ObjectId(toSessionId),
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    { session },
  );

  // Optionally generate an admission invoice in the new session
  let invoice: any = null;
  if (generateAdmissionInvoice && student.admissionFee > 0) {
    const now = new Date();
    const invoiceNumber = await nextNumber("DN-INV");

    const lineItems = [
      {
        feeType: "admissionFee",
        label: "Admission Fee",
        amount: student.admissionFee,
        discount: 0,
        net: student.admissionFee,
      },
    ];

    [invoice] = await Invoice.create(
      [
        {
          invoiceNumber,
          studentId: student._id,
          sessionId: new mongoose.Types.ObjectId(toSessionId),
          branch: student.branch,
          invoiceType: "admission",
          periodYear: null,
          periodMonth: null,
          lineItems,
          subtotal: student.admissionFee,
          totalDiscount: 0,
          netPayable: student.admissionFee,
          adjustmentAmount: 0,
          paidAmount: 0,
          dueAmount: student.admissionFee,
          status: InvoiceStatus.UNPAID,
          isLocked: false,
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          deleteReason: null,
          createdBy: new mongoose.Types.ObjectId(userId),
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      ],
      { session },
    );
  }

  return {
    success: {
      studentId,
      action,
      newEnrollmentId: newEnrollment[0]._id,
      invoiceId: invoice?._id ?? null,
      note,
    },
  };
}

export const promoteStudent = async ({
  body,
  userId,
}: {
  body: IPromoteStudent;
  userId: string;
}) => {
  const parsed = promoteStudentZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid promotion data") };
  }
  const data = parsed.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await promoteOne(
      data.studentId,
      data.toClassId,
      data.toSessionId,
      data.action,
      data.note,
      data.generateAdmissionInvoice,
      userId,
      session,
    );

    if (result.error) {
      await session.abortTransaction();
      return { error: result.error };
    }

    await session.commitTransaction();
    return { success: result.success };
  } catch (err: any) {
    await session.abortTransaction();
    return { serverError: { message: err.message } };
  } finally {
    session.endSession();
  }
};

export const bulkPromote = async ({
  body,
  userId,
}: {
  body: IBulkPromote;
  userId: string;
}) => {
  const parsed = bulkPromoteZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid bulk promotion data") };
  }
  const data = parsed.data;

  const results: { studentId: string; status: "ok" | "error"; message?: string }[] = [];

  for (const studentId of data.studentIds) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await promoteOne(
        studentId,
        data.toClassId,
        data.toSessionId,
        data.action,
        undefined,
        data.generateAdmissionInvoice,
        userId,
        session,
      );

      if (result.error) {
        await session.abortTransaction();
        results.push({ studentId, status: "error", message: result.error.message });
      } else {
        await session.commitTransaction();
        results.push({ studentId, status: "ok" });
      }
    } catch (err: any) {
      await session.abortTransaction();
      results.push({ studentId, status: "error", message: err.message });
    } finally {
      session.endSession();
    }
  }

  const successCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return {
    success: {
      total: data.studentIds.length,
      promoted: successCount,
      failed: errorCount,
      results,
    },
  };
};
