import {
  FeeType,
  IPayAdmissionDue,
  IUser,
  payAdmissionDueZ,
  PaymentStatus,
  TransactionType,
} from "@/validations";
import { Student } from "../models/students.model";
import { Session } from "../models/sessions.model";
import { FeeCollection } from "../models/feeCollections.model";
import { createTransactionLog } from "./transactions.service";
import z from "zod";
import { schemaValidationError } from "../error";

export const payAdmissionDue = async ({
  body,
  authUser,
}: {
  body: IPayAdmissionDue;
  authUser: IUser;
}) => {
  // Safe Parse for better error handling
  const validData = payAdmissionDueZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  if (!validData.data.receivedAmount || validData.data.receivedAmount <= 0) {
    return {
      error: {
        message: "Received amount must be greater than zero",
        fields: [
          { name: "receivedAmount", message: "Received amount must be > 0" },
        ],
      },
    };
  }

  console.log("ID: ", validData.data);

  try {
    const student = await Student.findById(validData.data.studentId);

    if (!student) {
      return { error: { message: "Student not found" } };
    }

    const session = await Session.findById(student.currentSessionId);

    if (!session || !session.isActive) {
      return { error: { message: "Invalid or inactive session" } };
    }

    // Fetch existing admission fee collection
    const admissionFee = await FeeCollection.findOne({
      studentId: validData.data.studentId,
      sessionId: student.currentSessionId,
      feeType: FeeType.ADMISSION,
      isDeleted: false,
    });

    if (!admissionFee) {
      return {
        error: { message: "Admission fee record not found" },
      };
    }

    // ===== CURRENT BALANCE =====
    const admissionBalance = student.feeBalance?.admissionFee || {
      due: 0,
      advance: 0,
    };

    let payableAmount = admissionBalance.due - admissionBalance.advance;

    if (payableAmount <= 0) {
      return {
        error: { message: "No admission due available" },
      };
    }

    // ===== CALCULATION =====
    let dueAmount = 0;
    let advanceAmount = 0;
    let paymentStatus = PaymentStatus.PARTIAL;

    if (validData.data.receivedAmount >= payableAmount) {
      paymentStatus = PaymentStatus.PAID;
      advanceAmount = validData.data.receivedAmount - payableAmount;
      dueAmount = 0;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
      dueAmount = payableAmount - validData.data.receivedAmount;
      advanceAmount = 0;
    }

    // ===== UPDATE FEE COLLECTION =====
    await FeeCollection.findByIdAndUpdate(admissionFee._id, {
      $inc: {
        receivedAmount: validData.data.receivedAmount,
        advanceAmount,
      },
      $set: {
        dueAmount,
        paymentStatus,
      },
    });

    // ===== UPDATE STUDENT BALANCE =====
    const s = await Student.findByIdAndUpdate(validData.data.studentId, {
      $set: {
        "feeBalance.admissionFee.due": dueAmount,
        "feeBalance.admissionFee.advance": advanceAmount,
      },
    });

    console.log("S: ", s);
    console.log("Due: ", dueAmount);
    console.log("Payable: ", payableAmount);

    // ===== TRANSACTION LOG =====
    await createTransactionLog({
      transactionType: TransactionType.INCOME,
      referenceId: admissionFee._id,
      referenceModel: "FeeCollection",
      amount: validData.data.receivedAmount,
      description: "Admission fee due payment",
      performedBy: authUser._id,
      branch: student.branch,
    });

    return {
      success: {
        success: true,
        message: "Admission fee payment adjusted successfully",
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};
