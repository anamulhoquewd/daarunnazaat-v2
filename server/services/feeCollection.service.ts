import {
  Branch,
  feeCollectionZ,
  FeeType,
  IFeeCollection,
  IUser,
  mongoIdZ,
  monthlyFees,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  TransactionType,
} from "@/validations";
import { feeUpdateSchema } from "@/validations/student";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { FeeCollection } from "../models/feeCollections.model";
import { Session } from "../models/sessions.model";
import { Student } from "../models/students.model";
import pagination from "../utils/pagination";
import { generateFeeReceiptNumber } from "../utils/string-generator";
import { createTransactionLog } from "./transactions.service";

export const register = async ({
  body,
  authUser,
}: {
  body: IFeeCollection;
  authUser: IUser;
}) => {
  // Safe Parse for better error handling
  const validData = feeCollectionZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const student = await Student.findById(validData.data.studentId);

    if (!student) {
      return { error: { message: "Student not found" } };
    }

    const session = await Session.findById(student.currentSessionId);

    if (!session || !session.isActive) {
      return {
        error: { message: "Invalid or deactive student current session" },
      };
    }

    if (validData.data.feeType === FeeType.ADMISSION) {
      return {
        error: {
          message:
            "Admission fee cannot be registered here. Use payAdmissionDue API.",
        },
      };
    }

    // No balance, ad-hoc
    const nonBalancedFeeTypes: FeeType[] = [FeeType.UTILITY, FeeType.OTHER];

    // Only check duplicate based on fee type rules
    let isFeeExist: IFeeCollection | null = null;

    if (monthlyFees.includes(validData.data.feeType)) {
      // Monthly type → student + session + period unique
      if (!validData.data.period) {
        return {
          error: {
            message: "Period is required for this fee type",
            fields: [{ name: "period", message: "Period is required" }],
          },
        };
      }

      isFeeExist = await FeeCollection.findOne({
        studentId: validData.data.studentId,
        sessionId: student.currentSessionId,
        feeType: validData.data.feeType,
        period: validData.data.period,
        isDeleted: false,
      });
    }

    // If duplicate exists, throw error
    if (isFeeExist) {
      return {
        error: {
          message: "Fee already collected for this period.",
          fields: [
            {
              name: "feeType",
              message: `Fee already collected for ${validData.data.feeType} for ${validData.data.period}`,
            },
          ],
        },
      };
    }

    // ===== GET BASE AMOUNT FROM STUDENT =====
    let baseAmount = 0;

    if (monthlyFees.includes(validData.data.feeType)) {
      // For configured fees (admission, monthly, residential, etc.)
      const feeField = validData.data.feeType; // Direct use - no map needed

      if ((student as any)[feeField] == null) {
        return {
          error: {
            message: `${validData.data.feeType} is not configured for this student`,
          },
        };
      }

      baseAmount = (student as any)[feeField] as number;
    } else if (nonBalancedFeeTypes.includes(validData.data.feeType)) {
      // For UTILITY/OTHER fees - must provide payableAmount
      if (!validData.data.payableAmount || validData.data.payableAmount <= 0) {
        return {
          error: {
            message: "Payable amount is required for this fee type",
            fields: [
              {
                name: "payableAmount",
                message: "Payable amount is required",
              },
            ],
          },
        };
      }

      baseAmount = validData.data.payableAmount;
    } else {
      return {
        error: { message: "Invalid fee type" },
      };
    }

    // ===== GET PREVIOUS BALANCE (DUE/ADVANCE) =====
    // Only for fees that have balance tracking
    let previousDue = 0;
    let previousAdvance = 0;

    if (monthlyFees.includes(validData.data.feeType)) {
      const feeBalance =
        ((student as any).feeBalance?.[validData.data.feeType] as any) || {};
      previousDue = feeBalance.due || 0;
      previousAdvance = feeBalance.advance || 0;
    }

    // ===== CALCULATE PAYABLE AMOUNT =====
    // payableAmount = baseAmount + previousDue - previousAdvance
    let payableAmount = baseAmount + previousDue - previousAdvance;

    const receivedAmount = validData.data.receivedAmount || 0;

    // ===== CALCULATION =====
    let dueAmount = 0;
    let advanceAmount = 0;
    let paymentStatus = PaymentStatus.PARTIAL;

    if (receivedAmount >= payableAmount) {
      paymentStatus = PaymentStatus.PAID;
      advanceAmount = receivedAmount - payableAmount;
      dueAmount = 0;
    } else if (receivedAmount === 0) {
      paymentStatus = PaymentStatus.DUE;
      dueAmount = payableAmount - receivedAmount;
      advanceAmount = 0;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
      dueAmount = payableAmount - receivedAmount;
      advanceAmount = 0;
    }

    const receiptNumber = await generateFeeReceiptNumber();

    // Create fee
    const newFee = new FeeCollection({
      ...validData.data,
      receiptNumber,
      collectedBy: authUser._id,
      branch: student.branch,
      baseAmount,
      payableAmount,
      dueAmount,
      advanceAmount,
      paymentStatus,
      sessionId: student.currentSessionId,
    });

    // Save fee
    const fee = await newFee.save();

    // ===== UPDATE STUDENT BALANCE =====
    // Only update balance for configured fee types (not UTILITY/OTHER)
    if (monthlyFees.includes(validData.data.feeType)) {
      const updatePath = `feeBalance.${validData.data.feeType}`;

      await Student.findByIdAndUpdate(
        validData.data.studentId,
        {
          $set: {
            [`${updatePath}.due`]: dueAmount,
            [`${updatePath}.advance`]: advanceAmount,
          },
        },
        { new: true },
      );
    }

    // Create Transaction Log
    if (validData.data.receivedAmount > 0) {
      await createTransactionLog({
        transactionType: TransactionType.INCOME,
        referenceId: fee._id,
        referenceModel: "FeeCollection",
        amount: validData.data.receivedAmount,
        description: `${validData.data.feeType} fee collected`,
        performedBy: authUser._id,
        branch: student.branch,
      });
    }

    return {
      success: {
        success: true,
        message: "Fee created successfully",
        data: fee,
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

export const updates = async ({
  _id,
  body,
  updatedByUserId,
}: {
  _id: string;
  body: Partial<IFeeCollection>;
  updatedByUserId: string;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate body
  if (!body || Object.keys(body).length === 0) {
    return {
      success: {
        success: true,
        message: "No updates provided, returning existing fee",
        data: await FeeCollection.findById(_id),
      },
    };
  }

  const validData = feeUpdateSchema.safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Fetch existing fee
    const fee = await FeeCollection.findById(idValidation.data._id);
    if (!fee) {
      return { error: { message: "Fee not found with the provided ID" } };
    }

    if (fee.isDeleted) {
      return {
        error: {
          message: "This fee record has been deleted and cannot be updated.",
        },
      };
    }

    if (validData.data && !validData.data.remarks) {
      return {
        error: {
          message:
            "Remarks is required when correcting period or amount changed",
        },
      };
    }

    const isPeriodChanged =
      validData.data.period && validData.data.period !== fee.period;

    if (monthlyFees.includes(fee.feeType as FeeType) && isPeriodChanged) {
      const targetPeriod = validData.data.period ?? fee.period;

      const duplicateFee = await FeeCollection.findOne({
        _id: { $ne: fee._id }, // exclude current fee
        studentId: fee.studentId,
        sessionId: fee.sessionId,
        feeType: fee.feeType,
        period: targetPeriod,
        isDeleted: false,
      });

      if (duplicateFee) {
        return {
          error: {
            message: "Fee already exists for the selected period.",
            fields: [
              {
                name: "period",
                message: `A ${fee.feeType} fee already exists for ${targetPeriod}`,
              },
            ],
          },
        };
      }
    }

    const oldReceived = fee.receivedAmount;

    // ===== RECALCULATE =====
    let dueAmount = 0;
    let advanceAmount = 0;
    let paymentStatus = PaymentStatus.PARTIAL;
    let payableAmount = fee.payableAmount ?? 0;

    if (validData.data.payableAmount != null) {
      payableAmount = validData.data.payableAmount;
    }

    const newReceived = validData.data.receivedAmount ?? fee.receivedAmount;

    if (newReceived >= payableAmount) {
      paymentStatus = PaymentStatus.PAID;
      advanceAmount = newReceived - payableAmount;
      dueAmount = 0;
    } else if (newReceived === 0) {
      paymentStatus = PaymentStatus.DUE;
      dueAmount = payableAmount - newReceived;
      advanceAmount = 0;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
      dueAmount = payableAmount - newReceived;
      advanceAmount = 0;
    }

    fee.dueAmount = dueAmount;
    fee.advanceAmount = advanceAmount;
    fee.paymentStatus = paymentStatus;
    fee.updatedBy = updatedByUserId;

    Object.assign(fee, validData.data);

    const updatedFee = await fee.save();

    // ===== UPDATE STUDENT BALANCE =====
    // Only update balance for configured fee types (not UTILITY/OTHER)
    const configuredFeeTypes: FeeType[] = [
      FeeType.ADMISSION,
      FeeType.MONTHLY,
      FeeType.RESIDENTIAL,
      FeeType.COACHING,
      FeeType.DAYCARE,
      FeeType.MEAL,
    ];

    if (configuredFeeTypes.includes(fee.feeType as FeeType)) {
      const updatePath = `feeBalance.${fee.feeType}`;

      await Student.findByIdAndUpdate(
        fee.studentId,
        {
          $set: {
            [`${updatePath}.due`]: dueAmount,
            [`${updatePath}.advance`]: advanceAmount,
          },
        },
        { new: true },
      );
    }

    // ===== TRANSACTION LOG FOR DIFFERENCE =====
    const diff = fee.receivedAmount - oldReceived;

    if (diff !== 0) {
      await createTransactionLog({
        transactionType:
          diff > 0 ? TransactionType.INCOME : TransactionType.ADJUSTMENT,
        referenceId: fee._id,
        referenceModel: "FeeCollection",
        amount: Math.abs(diff),
        description: `Fee amount updated (${diff > 0 ? "+" : "-"}${Math.abs(diff)})`,
        performedBy: updatedByUserId,
        branch: fee.branch ?? Branch.BALIKA_BRANCH,
      });
    }

    return {
      success: {
        success: true,
        message: "Fee updated successfully",
        data: updatedFee,
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

export const gets = async (queryParams: {
  page: number;
  limit: number;
  sortWith: string;
  sortOrder: string;

  search: string;
  period: string;
  paymentMethod: PaymentMethod;
  paymentDate: { from: Date | string; to: Date | string };
  feeRange: { min: number | undefined; max: number | undefined };
  collectedBy: string;
  studentId: string;
  sessionId: string;
  branch: Branch;
  feeType: FeeType;
  paymentSource: PaymentSource;
}) => {
  try {
    // Build query
    const query: any = {
      isDeleted: false,
    };

    // Search by receiptNumber or _id
    if (queryParams.search) {
      query.$or = [
        { receiptNumber: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    // Filter by studentId
    if (
      queryParams.studentId &&
      mongoose.Types.ObjectId.isValid(queryParams.studentId)
    ) {
      query.studentId = new mongoose.Types.ObjectId(queryParams.studentId);
    }

    // Filter by collectedBy
    if (
      queryParams.collectedBy &&
      mongoose.Types.ObjectId.isValid(queryParams.collectedBy)
    ) {
      query.collectedBy = new mongoose.Types.ObjectId(queryParams.collectedBy);
    }

    // Filter by sessionId
    if (
      queryParams.sessionId &&
      mongoose.Types.ObjectId.isValid(queryParams.sessionId)
    ) {
      query.sessionId = new mongoose.Types.ObjectId(queryParams.sessionId);
    }

    // Filter by branch
    if (queryParams.branch) {
      query.branch = queryParams.branch;
    }

    // Filter by feeType
    if (queryParams.feeType) {
      query.feeType = queryParams.feeType;
    }

    // Filter by paymentSource
    if (queryParams.paymentSource) {
      query.paymentSource = queryParams.paymentSource;
    }

    // Filter by paymentMethod
    if (queryParams.paymentMethod) {
      query.paymentMethod = queryParams.paymentMethod;
    }

    // Filter by period
    if (queryParams.period) {
      query.period = queryParams.period;
    }

    // Filter by paymentDate range
    if (queryParams.paymentDate) {
      const dateFilter: any = {};
      if (queryParams.paymentDate.from) {
        dateFilter.$gte = new Date(queryParams.paymentDate.from);
      }
      if (queryParams.paymentDate.to) {
        dateFilter.$lte = new Date(queryParams.paymentDate.to);
      }
      if (Object.keys(dateFilter).length > 0) {
        query.paymentDate = dateFilter;
      }
    }

    // Filter by feeRange
    if (queryParams.feeRange.min && queryParams.feeRange.max) {
      const feeFilter: any = {};
      if (queryParams.feeRange.min != null) {
        feeFilter.$gte = queryParams.feeRange.min;
      }
      if (queryParams.feeRange.max != null) {
        feeFilter.$lte = queryParams.feeRange.max;
      }
      if (Object.keys(feeFilter).length > 0) {
        query.receivedAmount = feeFilter;
      }
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "paymentDate"].includes(
      queryParams.sortWith,
    )
      ? queryParams.sortWith
      : "updatedAt";
    const sortDirection =
      queryParams.sortOrder?.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch fees with pagination
    const [fees, total, docsCount] = await Promise.all([
      FeeCollection.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("studentId")
        .populate("sessionId", "sessionName isActive")
        .populate("collectedBy", "phone roles")
        .exec(),
      FeeCollection.countDocuments(query),
      FeeCollection.countDocuments(),
    ]);

    // Pagination helper
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
      totalDocs: docsCount,
    });

    return {
      success: {
        success: true,
        message: "Fee fetched successfully!",
        data: fees,
        pagination: createPagination,
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

export const get = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // Check if Fee exists
    const fee = await FeeCollection.findById(idValidation.data._id)
      .populate("studentId")
      .populate("sessionId", "sessionName isActive")
      .populate("collectedBy", "phone roles")
      .exec();

    if (!fee) {
      return {
        error: {
          message: `Fee not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Fee fetched successfully!`,
        data: fee,
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

export const deleteFlag = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const fee = await FeeCollection.findById(idValidation.data._id);

    if (!fee) {
      return {
        error: {
          message: `Fee not found with provided ID!`,
        },
      };
    }

    // isDeleted flag is on inside delete
    fee.isDeleted = true;
    fee.deletedAt = new Date();

    await fee.save();

    // Response
    return {
      success: {
        success: true,
        message: `Fee deleted successfully!`,
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

export const restoreFee = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check fee exists
    const fee = await FeeCollection.findById(_id);

    if (!fee) {
      return {
        error: {
          message: `fee not found with provided ID!`,
        },
      };
    }

    if (!fee.isDeleted) {
      return { error: { message: "fee not deleted." } };
    }

    fee.isDeleted = false;
    fee.deletedAt = null;
    await fee.save();

    return {
      success: {
        success: true,
        message: "Fee RESTORED successfully",
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

// Permanent delete (hard delete) - use with caution
export const permanentDelete = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const fee = await FeeCollection.findById(idValidation.data._id);

    if (!fee) {
      return { error: { message: "fee not found!" } };
    }

    await fee.deleteOne();

    return {
      success: {
        success: true,
        message: "fee deleted successfully",
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
