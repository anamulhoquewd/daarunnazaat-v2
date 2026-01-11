import {
  Branch,
  feeCollectionsUpdateZ,
  feeCollectionZ,
  FeeType,
  IFeeCollection,
  IUser,
  mongoIdZ,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  TransactionType,
} from "@/validations";
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
    // Define which fee types are monthly
    const monthlyFees = [
      FeeType.MONTHLY,
      FeeType.RESIDENTIAL,
      FeeType.COACHING,
      FeeType.DAYCARE,
      FeeType.MEAL,
    ];

    // Only check duplicate if the fee type is monthly
    let isExistFee: IFeeCollection | null = null;

    if (monthlyFees.includes(validData.data.feeType)) {
      const query: any = {
        studentId: validData.data.studentId,
        sessionId: validData.data.sessionId,
        feeType: validData.data.feeType,
        month: validData.data.month,
        year: validData.data.year,
      };

      isExistFee = await FeeCollection.findOne(query);
    }

    // If duplicate exists, throw error
    if (isExistFee) {
      return {
        error: {
          message: "Fee already collected for this period.",
          fields: [
            {
              name: "feeType",
              message: `Fee already collected for this fee type ${validData.data.feeType} for ${validData.data.month}/${validData.data.year}`,
            },
          ],
        },
      };
    }

    const student = await Student.findById(validData.data.studentId);

    if (!student) {
      return { error: { message: "Student not found" } };
    }

    const session = await Session.findById(validData.data.sessionId);

    if (!session || !session.isActive) {
      return { error: { message: "Invalid or inactive session" } };
    }

    const receiptNumber = await generateFeeReceiptNumber();

    // Create fee
    const feeCollection = new FeeCollection({
      ...validData.data,
      receiptNumber,
      collectedBy: authUser._id,
    });

    // Save fee
    const docs = await feeCollection.save();

    // Create Transaction Log
    await createTransactionLog({
      transactionType: TransactionType.INCOME,
      referenceId: docs._id,
      referenceModel: "FeeCollection",
      amount: docs.paidAmount,
      description: `Fee collected for ${docs.feeType} | ${docs.month}/${docs.year}`,
      performedBy: authUser._id,
      branch: student.branch,
    });

    return {
      success: {
        success: true,
        message: "Fee created successfully",
        data: docs,
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

  const bodyValidation = feeCollectionsUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
    };
  }

  try {
    //  Fetch existing fee
    const fee = await FeeCollection.findById(idValidation.data._id);
    if (!fee) {
      return { error: { message: "Fee not found with the provided ID" } };
    }

    // Save old values for logging
    const oldPaidAmount = fee.paidAmount;
    const oldDueAmount = fee.dueAmount;
    const oldStatus = fee.paymentStatus;

    // Update only provided fields
    Object.assign(fee, bodyValidation.data);

    // Recalculate dueAmount & paymentStatus
    const payable = fee.amount - (fee.discount || 0);
    fee.dueAmount = Math.max(payable - fee.paidAmount, 0);
    fee.paymentStatus =
      fee.dueAmount === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

    // Save updated fee
    const updatedFee = await fee.save();

    // Create transaction log if amount or status changed
    const logs: Promise<any>[] = [];

    // Paid amount changed → income / adjustment
    if (updatedFee.paidAmount !== oldPaidAmount) {
      const diff = updatedFee.paidAmount - oldPaidAmount;
      const type =
        diff > 0 ? TransactionType.INCOME : TransactionType.ADJUSTMENT; // negative → adjustment/reversal

      logs.push(
        createTransactionLog({
          transactionType: type,
          referenceId: updatedFee._id,
          referenceModel: "FeeCollection",
          amount: Math.abs(diff),
          description: `Fee payment ${
            diff > 0 ? "increased" : "adjusted"
          } for ${updatedFee.feeType} | ${updatedFee.month || "N/A"}/${
            updatedFee.year
          }`,
          performedBy: updatedByUserId,
          branch: updatedFee.branch,
        })
      );
    }

    // Status changed → reversal / paid
    if (updatedFee.paymentStatus !== oldStatus) {
      if (
        updatedFee.paymentStatus === PaymentStatus.PAID &&
        oldStatus !== PaymentStatus.PAID
      ) {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.INCOME,
            referenceId: updatedFee._id,
            referenceModel: "FeeCollection",
            amount: updatedFee.paidAmount,
            description: `Fee marked as PAID for ${updatedFee.feeType} | ${
              updatedFee.month || "N/A"
            }/${updatedFee.year}`,
            performedBy: updatedByUserId,
            branch: updatedFee.branch,
          })
        );
      } else if (
        updatedFee.paymentStatus === PaymentStatus.PARTIAL &&
        oldStatus === PaymentStatus.PAID
      ) {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.ADJUSTMENT,
            referenceId: updatedFee._id,
            referenceModel: "FeeCollection",
            amount: updatedFee.paidAmount,
            description: `Fee status changed to PARTIAL for ${
              updatedFee.feeType
            } | ${updatedFee.month || "N/A"}/${updatedFee.year}`,
            performedBy: updatedByUserId,
            branch: updatedFee.branch,
          })
        );
      }
    }

    await Promise.all(logs);

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
  sortBy: string;
  sortType: string;

  search: string;
  month: string;
  year: string;
  paymentMethod: PaymentMethod;
  paymentDate: { from: Date | string; to: Date | string };
  feeRange: { min: number; max: number };
  collectedBy: string;
  studentId: string;
  sessionId: string;
  branch: Branch;
  feeType: FeeType;
  paymentSource: PaymentSource;
}) => {
  try {
    // Build query
    const query: any = {};

    // Search by receiptNumber or _id
    if (queryParams.search) {
      query.$or = [
        { receiptNumber: { $regex: queryParams.search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
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

    // Filter by month & year
    if (queryParams.month) {
      query.month = parseInt(queryParams.month, 10);
    }
    if (queryParams.year) {
      query.year = parseInt(queryParams.year, 10);
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
        query.paidAmount = feeFilter;
      }
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt"].includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType?.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch fees with pagination
    const [fees, total] = await Promise.all([
      FeeCollection.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      FeeCollection.countDocuments(query),
    ]);

    console.log("Query: ", query);

    // Pagination helper
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
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
    const fee = await FeeCollection.findById(idValidation.data._id);

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

export const deletes = async (_id: string) => {
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

    // Delete fee
    await fee.deleteOne();

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
