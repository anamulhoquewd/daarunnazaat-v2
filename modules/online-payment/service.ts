import mongoose from "mongoose";
import { OnlinePayment } from "./schema";
import { Invoice } from "@/modules/invoice/schema";
import { Payment } from "@/modules/payment/schema";
import { Student } from "@/modules/student/schema";
import { Guardian } from "@/modules/guardian/schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { OnlinePaymentStatus, OnlinePaymentProvider, PaymentMethod, InvoiceStatus } from "@/validations";

/** Resolve guardianId from userId */
async function resolveGuardian(userId: string) {
  const guardian = await Guardian.findOne({ userId, isDeleted: false }).lean();
  return guardian;
}

/** Verify all invoiceIds belong to this student and are unpaid/partial */
async function validateInvoices(invoiceIds: string[], studentId: string) {
  const invoices = await Invoice.find({
    _id: { $in: invoiceIds },
    studentId,
    isDeleted: false,
    status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
  }).lean();

  if (invoices.length !== invoiceIds.length) {
    return { error: "One or more invoices not found, already paid, or do not belong to this student" };
  }

  const total = invoices.reduce((sum: number, inv: any) => sum + inv.dueAmount, 0);
  return { invoices, total };
}

/**
 * Initiate a dummy bKash/Nagad payment.
 * Returns a transactionRef the guardian polls or uses on callback.
 */
export const initiatePayment = async ({
  userId,
  studentId,
  invoiceIds,
  provider,
}: {
  userId: string;
  studentId: string;
  invoiceIds: string[];
  provider: OnlinePaymentProvider;
}) => {
  try {
    if (!invoiceIds || invoiceIds.length === 0)
      return { error: { message: "Select at least one invoice to pay" } };

    const guardian = await resolveGuardian(userId);
    if (!guardian) return { error: { message: "Guardian profile not found" } };

    const student = await Student.findOne({
      _id: studentId,
      guardianId: (guardian as any)._id,
      isDeleted: false,
    }).lean();
    if (!student) return { error: { message: "Student not found or not your child" } };

    const validation = await validateInvoices(invoiceIds, studentId);
    if ("error" in validation) return { error: { message: validation.error } };

    const { total } = validation;
    if (total <= 0) return { error: { message: "No outstanding amount to pay" } };

    // Generate a unique transaction reference
    const now = new Date();
    const transactionRef = `ONL-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${Date.now()}`;

    const onlinePay = await OnlinePayment.create({
      transactionRef,
      guardianId: (guardian as any)._id,
      studentId: new mongoose.Types.ObjectId(studentId),
      invoiceIds: invoiceIds.map((id) => new mongoose.Types.ObjectId(id)),
      provider,
      totalAmount: total,
      status: OnlinePaymentStatus.PENDING,
      initiatedAt: now,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    return {
      success: {
        transactionRef,
        totalAmount: total,
        provider,
        // Dummy: in production this would be a redirect URL to bKash/Nagad
        paymentUrl: `/api/v1/online-payments/dummy-gateway?ref=${transactionRef}`,
        onlinePaymentId: onlinePay._id,
      },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

/**
 * Confirm a pending payment (dummy callback — simulates bKash/Nagad webhook).
 * In production this would be called by the payment gateway, not the client.
 */
export const confirmPayment = async ({
  transactionRef,
  providerRef,
  userId,
}: {
  transactionRef: string;
  providerRef: string;
  userId: string;
}) => {
  const onlinePay = await OnlinePayment.findOne({ transactionRef });
  if (!onlinePay) return { error: { message: "Transaction not found" } };
  if (onlinePay.status !== OnlinePaymentStatus.PENDING)
    return { error: { message: `Transaction already ${onlinePay.status}` } };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoiceIds = onlinePay.invoiceIds.map((id) => id.toString());
    const invoices = await Invoice.find({ _id: { $in: invoiceIds } }).session(session);

    const now = new Date();
    const receiptNumber = await nextNumber("DN-RCP");
    const paymentMethod =
      onlinePay.provider === OnlinePaymentProvider.BKASH
        ? PaymentMethod.BKASH
        : PaymentMethod.NAGAD;

    const allocations = invoices.map((inv) => ({
      invoiceId: inv._id,
      allocatedAmount: inv.dueAmount,
    }));

    for (const inv of invoices) {
      await Invoice.findByIdAndUpdate(
        inv._id,
        {
          $set: {
            paidAmount: inv.netPayable,
            dueAmount: 0,
            status: InvoiceStatus.PAID,
            isLocked: true,
            updatedBy: new mongoose.Types.ObjectId(userId),
          },
        },
        { session },
      );
    }

    await Payment.create(
      [
        {
          receiptNumber,
          studentId: onlinePay.studentId,
          sessionId: (invoices[0] as any).sessionId,
          branch: (invoices[0] as any).branch,
          paymentDate: now,
          paymentMethod,
          paidBy: new mongoose.Types.ObjectId(userId),
          totalPaid: onlinePay.totalAmount,
          allocations,
          unallocatedAmount: 0,
          canDeleteUntil: new Date(0), // online payments cannot be undone
          notes: `Online payment via ${onlinePay.provider} — ref: ${providerRef}`,
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

    await OnlinePayment.findByIdAndUpdate(
      onlinePay._id,
      {
        $set: {
          status: OnlinePaymentStatus.COMPLETED,
          providerRef,
          completedAt: now,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { session },
    );

    await session.commitTransaction();
    return { success: { receiptNumber, message: "Payment confirmed successfully" } };
  } catch (err: any) {
    await session.abortTransaction();

    await OnlinePayment.findOneAndUpdate(
      { transactionRef },
      {
        $set: {
          status: OnlinePaymentStatus.FAILED,
          failedAt: new Date(),
          failureReason: err.message,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
    );

    return { serverError: { message: err.message } };
  } finally {
    session.endSession();
  }
};

export const getPaymentStatus = async (transactionRef: string, userId: string) => {
  try {
    const guardian = await resolveGuardian(userId);
    if (!guardian) return { error: { message: "Guardian not found" } };

    const onlinePay = await OnlinePayment.findOne({
      transactionRef,
      guardianId: (guardian as any)._id,
    }).lean();

    if (!onlinePay) return { error: { message: "Transaction not found" } };
    return { success: onlinePay };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};
