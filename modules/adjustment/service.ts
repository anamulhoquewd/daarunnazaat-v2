import mongoose from "mongoose";
import { Adjustment } from "./schema";
import { Invoice } from "@/modules/invoice/schema";
import { InvoiceStatus } from "@/validations";
import { schemaValidationError } from "@/server/error";
import {
  createAdjustmentZ,
  voidAdjustmentZ,
  listAdjustmentsQueryZ,
  type ICreateAdjustment,
} from "./validation";

function effectiveNetPayable(invoice: any): number {
  return invoice.netPayable + (invoice.adjustmentAmount ?? 0);
}

function computeStatus(paidAmount: number, effNet: number): InvoiceStatus {
  if (effNet <= 0) return InvoiceStatus.PAID; // fully waived
  if (paidAmount <= 0) return InvoiceStatus.UNPAID;
  if (paidAmount >= effNet) return InvoiceStatus.PAID;
  return InvoiceStatus.PARTIAL;
}

export const createAdjustment = async ({
  body,
  userId,
}: {
  body: ICreateAdjustment;
  userId: string;
}) => {
  const parsed = createAdjustmentZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid adjustment data") };
  }
  const data = parsed.data;

  try {
    const invoice = await Invoice.findById(data.invoiceId);
    if (!invoice || invoice.isDeleted) {
      return { error: { message: "Invoice not found" } };
    }
    if (invoice.status === InvoiceStatus.VOID) {
      return { error: { message: "Cannot adjust a voided invoice" } };
    }

    const newAdjustmentAmount = (invoice.adjustmentAmount ?? 0) + data.amount;
    const effNet = invoice.netPayable + newAdjustmentAmount;
    const newDueAmount = effNet - invoice.paidAmount;
    const newStatus = computeStatus(invoice.paidAmount, effNet);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [adjustment] = await Adjustment.create(
        [
          {
            invoiceId: data.invoiceId,
            studentId: invoice.studentId,
            type: data.type,
            amount: data.amount,
            reason: data.reason,
            appliedBy: userId,
            isVoided: false,
            createdBy: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      await Invoice.findByIdAndUpdate(
        data.invoiceId,
        {
          $set: {
            adjustmentAmount: newAdjustmentAmount,
            dueAmount: newDueAmount,
            status: newStatus,
            updatedBy: userId,
          },
        },
        { session },
      );

      await session.commitTransaction();
      return { success: adjustment };
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

export const voidAdjustment = async ({
  adjustmentId,
  userId,
  reason,
}: {
  adjustmentId: string;
  userId: string;
  reason: string;
}) => {
  const parsed = voidAdjustmentZ.safeParse({ reason });
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid void reason") };
  }

  try {
    const adjustment = await Adjustment.findById(adjustmentId);
    if (!adjustment || adjustment.isDeleted) {
      return { error: { message: "Adjustment not found" } };
    }
    if (adjustment.isVoided) {
      return { error: { message: "Adjustment is already voided" } };
    }

    const invoice = await Invoice.findById(adjustment.invoiceId);
    if (!invoice || invoice.isDeleted) {
      return { error: { message: "Associated invoice not found" } };
    }

    // Reverse the adjustment amount
    const newAdjustmentAmount = (invoice.adjustmentAmount ?? 0) - adjustment.amount;
    const effNet = invoice.netPayable + newAdjustmentAmount;
    const newDueAmount = effNet - invoice.paidAmount;
    const newStatus = computeStatus(invoice.paidAmount, effNet);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Adjustment.findByIdAndUpdate(
        adjustmentId,
        {
          $set: {
            isVoided: true,
            voidedAt: new Date(),
            voidReason: reason,
            voidedBy: userId,
            updatedBy: userId,
          },
        },
        { session },
      );

      await Invoice.findByIdAndUpdate(
        adjustment.invoiceId,
        {
          $set: {
            adjustmentAmount: newAdjustmentAmount,
            dueAmount: newDueAmount,
            status: newStatus,
            updatedBy: userId,
          },
        },
        { session },
      );

      await session.commitTransaction();
      return { success: { message: "Adjustment voided successfully" } };
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

export const listAdjustments = async (rawQuery: Record<string, unknown>) => {
  const parsed = listAdjustmentsQueryZ.safeParse(rawQuery);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid query parameters") };
  }
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.invoiceId) filter.invoiceId = q.invoiceId;
    if (q.studentId) filter.studentId = q.studentId;
    if (q.isVoided !== undefined) filter.isVoided = q.isVoided;

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      Adjustment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit).lean(),
      Adjustment.countDocuments(filter),
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
