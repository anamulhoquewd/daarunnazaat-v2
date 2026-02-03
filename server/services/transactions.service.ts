import {
  Branch,
  ITransactionLog,
  mongoIdZ,
  transactionLogZ,
  TransactionType,
} from "@/validations";
import { schemaValidationError } from "../error";
import { TransactionLog } from "../models/transactionsLog.model";
import mongoose from "mongoose";
import pagination from "../utils/pagination";

export const createTransactionLog = async (body: ITransactionLog) => {
  // Safe Parse for better error handling
  const validData = transactionLogZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const transactionLog = new TransactionLog(validData.data);

    const log = await transactionLog.save();

    return {
      success: true,
      data: transactionLog,
    };
  } catch (error: any) {
    console.error("Transaction log creation failed:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

export const gets = async (queryParams: {
  page: number;
  limit: number;
  sortBy: string;
  sortType: string;
  search: string;
  transactionType: TransactionType;
  referenceModel: string;
  createdDate: { from: Date | string; to: Date | string };
  amountRange: { min: number; max: number };
  referenceId: string;
  branch: Branch;
}) => {
  try {
    // Build query
    const query: any = {};

    // Search by receiptNumber or _id
    if (queryParams.search) {
      query.$or = [
        { description: { $regex: queryParams.search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }

    // Filter by referenceId
    if (
      queryParams.referenceId &&
      mongoose.Types.ObjectId.isValid(queryParams.referenceId)
    ) {
      query.referenceId = new mongoose.Types.ObjectId(queryParams.referenceId);
    }

    // Filter by branch
    if (queryParams.branch) {
      query.branch = queryParams.branch;
    }

    // Filter by referenceModel
    if (queryParams.referenceModel) {
      query.referenceModel = queryParams.referenceModel;
    }

    // Filter by transactionType
    if (queryParams.transactionType) {
      query.transactionType = queryParams.transactionType;
    }

    // Filter by createdAt range
    if (queryParams.createdDate) {
      const dateFilter: any = {};
      if (queryParams.createdDate.from) {
        dateFilter.$gte = new Date(queryParams.createdDate.from);
      }
      if (queryParams.createdDate.to) {
        dateFilter.$lte = new Date(queryParams.createdDate.to);
      }
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }
    }

    // Filter by Amount range
    if (queryParams.amountRange.min && queryParams.amountRange.max) {
      const transactionFilter: any = {};
      if (queryParams.amountRange.min != null) {
        transactionFilter.$gte = queryParams.amountRange.min;
      }
      if (queryParams.amountRange.max != null) {
        transactionFilter.$lte = queryParams.amountRange.max;
      }
      if (Object.keys(transactionFilter).length > 0) {
        query.amount = transactionFilter;
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
      TransactionLog.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("referenceId")
        .populate("performedBy", "role phone")
        .exec(),
      TransactionLog.countDocuments(query),
    ]);

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
    const fee = await TransactionLog.findById(idValidation.data._id);

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
    const transaction = await TransactionLog.findById(idValidation.data._id);

    if (!transaction) {
      return {
        error: {
          message: `transaction not found with provided ID!`,
        },
      };
    }

    // Delete transaction
    await transaction.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `transaction deleted successfully!`,
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
