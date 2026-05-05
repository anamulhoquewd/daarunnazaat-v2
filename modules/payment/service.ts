import mongoose from "mongoose";
import { Payment } from "./schema";
import { Invoice } from "@/modules/invoice/schema";
import { Student } from "@/modules/student/schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { InvoiceStatus } from "@/validations";
import { schemaValidationError } from "@/server/error";
import {
  createPaymentZ,
  listPaymentsQueryZ,
  type ICreatePayment,
} from "./validation";

function computeInvoiceStatus(paidAmount: number, netPayable: number): InvoiceStatus {
  if (paidAmount <= 0) return InvoiceStatus.UNPAID;
  if (paidAmount >= netPayable) return InvoiceStatus.PAID;
  return InvoiceStatus.PARTIAL;
}

export const createPayment = async ({
  body,
  userId,
}: {
  body: ICreatePayment;
  userId: string;
}) => {
  const parsed = createPaymentZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid payment data") };
  }
  const data = parsed.data;

  try {
    const student = await Student.findById(data.studentId);
    if (!student || student.isDeleted) {
      return { error: { message: "Student not found" } };
    }

    // Pre-load all invoices to validate before opening transaction
    const invoiceIds = data.allocations.map((a) => a.invoiceId);
    let invoices: any[] = [];
    if (invoiceIds.length > 0) {
      invoices = await Invoice.find({
        _id: { $in: invoiceIds },
        studentId: data.studentId,
        isDeleted: false,
      }).lean();

      if (invoices.length !== invoiceIds.length) {
        return {
          error: { message: "One or more invoices not found or do not belong to this student" },
        };
      }

      const voided = invoices.find((inv: any) => inv.status === InvoiceStatus.VOID);
      if (voided) {
        return {
          error: { message: `Invoice ${voided.invoiceNumber} is voided and cannot accept payments` },
        };
      }
    }

    const now = new Date();
    const canDeleteUntil = new Date(now.getTime() + 5 * 60 * 1000);
    const allocSum = data.allocations.reduce((s, a) => s + a.allocatedAmount, 0);
    const unallocatedAmount = data.totalPaid - allocSum;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const receiptNumber = await nextNumber("ND-RCP");

      // Update each allocated invoice
      for (const alloc of data.allocations) {
        const invoice = invoices.find((inv: any) => inv._id.toString() === alloc.invoiceId);
        const newPaid = invoice.paidAmount + alloc.allocatedAmount;
        const newDue = Math.max(0, invoice.netPayable - newPaid);
        const newStatus = computeInvoiceStatus(newPaid, invoice.netPayable);

        await Invoice.findByIdAndUpdate(
          alloc.invoiceId,
          {
            $inc: { paidAmount: alloc.allocatedAmount },
            $set: { dueAmount: newDue, status: newStatus, isLocked: true },
          },
          { session },
        );
      }

      // Excess amount goes to student creditBalance
      if (unallocatedAmount > 0) {
        await Student.findByIdAndUpdate(
          data.studentId,
          { $inc: { creditBalance: unallocatedAmount } },
          { session },
        );
      }

      const [payment] = await Payment.create(
        [
          {
            receiptNumber,
            studentId: data.studentId,
            sessionId: data.sessionId,
            branch: data.branch,
            paymentDate: data.paymentDate ?? now,
            paymentMethod: data.paymentMethod,
            paidBy: userId,
            totalPaid: data.totalPaid,
            allocations: data.allocations.map((a) => ({
              invoiceId: a.invoiceId,
              allocatedAmount: a.allocatedAmount,
            })),
            unallocatedAmount,
            canDeleteUntil,
            notes: data.notes,
            createdBy: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return {
        success: {
          receiptNumber,
          paymentId: payment._id,
          canDeleteUntil,
          unallocatedAmount,
        },
      };
    } catch (err: any) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    return {
      serverError: {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const deletePayment = async ({
  paymentId,
  userId,
  reason,
}: {
  paymentId: string;
  userId: string;
  reason?: string;
}) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.isDeleted) {
      return { error: { message: "Payment not found" } };
    }

    const now = new Date();
    if (now > payment.canDeleteUntil) {
      return { error: { message: "5-minute undo window has expired" } };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Reverse each allocation
      for (const alloc of payment.allocations) {
        const invoice = await Invoice.findById(alloc.invoiceId).session(session);
        if (!invoice || invoice.isDeleted) continue;

        const newPaid = Math.max(0, invoice.paidAmount - alloc.allocatedAmount);
        const newDue = invoice.netPayable - newPaid;
        const newStatus = computeInvoiceStatus(newPaid, invoice.netPayable);

        await Invoice.findByIdAndUpdate(
          alloc.invoiceId,
          {
            $set: {
              paidAmount: newPaid,
              dueAmount: newDue,
              status: newStatus,
              isLocked: newPaid > 0,
            },
          },
          { session },
        );
      }

      // Reverse any creditBalance increment
      if (payment.unallocatedAmount > 0) {
        await Student.findByIdAndUpdate(
          payment.studentId,
          { $inc: { creditBalance: -payment.unallocatedAmount } },
          { session },
        );
      }

      await Payment.findByIdAndUpdate(
        paymentId,
        {
          $set: {
            isDeleted: true,
            deletedAt: now,
            deletedBy: userId,
            deleteReason: reason ?? "Undone within 5-minute window",
            updatedBy: userId,
          },
        },
        { session },
      );

      await session.commitTransaction();
      return { success: { message: "Payment reversed successfully" } };
    } catch (err: any) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    return {
      serverError: {
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

export const listPayments = async (rawQuery: Record<string, unknown>) => {
  const parsed = listPaymentsQueryZ.safeParse(rawQuery);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid query parameters") };
  }
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.studentId) filter.studentId = q.studentId;
    if (q.sessionId) filter.sessionId = q.sessionId;
    if (q.branch) filter.branch = q.branch;

    const skip = (q.page - 1) * q.limit;

    const [data, total] = await Promise.all([
      Payment.find(filter).sort({ paymentDate: -1 }).skip(skip).limit(q.limit).lean(),
      Payment.countDocuments(filter),
    ]);

    return {
      success: {
        data,
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const getPayment = async (paymentId: string) => {
  try {
    const payment = await Payment.findOne({ _id: paymentId, isDeleted: false })
      .populate("allocations.invoiceId")
      .lean();
    if (!payment) return { error: { message: "Payment not found" } };
    return { success: payment };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};
