import {
  Branch,
  expenseUpdateZ,
  expenseZ,
  IExpense,
  IExpenseUpdate,
  mongoIdZ,
  PaymentMethod,
  TransactionType,
} from "@/validations";
import mongoose from "mongoose";
import { schemaValidationError } from "@/server/error";
import { Expense } from "@/server/models/expences.model";
import pagination from "@/server/utils/pagination";
import { generateVoucherNumber } from "@/server/utils/string-generator";
import { createTransactionLog } from "./transactions.service";

export const register = async (body: IExpense) => {
  // Safe Parse for better error handling
  const validData = expenseZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const voucherNumber = await generateVoucherNumber();

    // Recalculate each item's total server-side — never trust frontend values.
    const sanitizedItems = (validData.data.items ?? []).map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    // Derive overall amount from the server-recalculated item totals.
    const amount =
      sanitizedItems.length > 0
        ? sanitizedItems.reduce((sum, item) => sum + item.total, 0)
        : validData.data.amount;

    const expensePayment = new Expense({
      ...validData.data,
      items: sanitizedItems,
      createdBy: body.createdBy,
      voucherNumber,
      amount,
    });

    const docs = await expensePayment.save();

    // Create Transaction Log
    await createTransactionLog({
      transactionType: TransactionType.EXPENSE,
      referenceId: docs._id,
      referenceModel: "Expense",
      amount: docs.amount,
      description: `Expense recorded: ${docs.category} - ${docs.description}`,
      performedBy: body.createdBy,
      branch: docs.branch[0],
    });

    return {
      success: {
        success: true,
        message: "Expense payment created successfully",
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
  updatedByUserId, // logged-in user id
}: {
  _id: string;
  body: IExpenseUpdate;
  updatedByUserId: string;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = expenseUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body",
      ),
    };
  }

  try {
    // Check if expense exists
    const expense = await Expense.findById(idValidation.data._id);

    if (!expense) {
      return {
        error: { message: "expense not found with the provided ID" },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing expense",
          data: expense,
        },
      };
    }

    // Save old values
    const oldAmount = expense.amount || 0;

    // Update only provided fields
    Object.assign(expense, { ...bodyValidation.data, createdBy: updatedByUserId });

    // Save expense
    const docs = await expense.save();

    if (docs.amount !== oldAmount) {
      await createTransactionLog({
        transactionType: TransactionType.ADJUSTMENT,
        referenceId: docs._id,
        referenceModel: "Expense",
        amount: oldAmount,
        description: `Expense adjusted for ${docs.category} - ${docs.description}`,
        performedBy: updatedByUserId,
        branch: docs.branch[0],
      });
    }

    return {
      success: {
        success: true,
        message: "Expense updated successfully",
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

export const gets = async (queryParams: {
  page: number;
  limit: number;
  sortBy: string;
  sortType: string;

  search?: string;

  paymentMethod?: PaymentMethod;
  amountRange?: { min?: number; max?: number };
  category?: string;
  createdBy?: string;
  expenseDateRange?: {
    from?: string | Date;
    to?: string | Date;
  };
  branch: Branch;
}) => {
  try {
    const query: any = {};

    // Search by voucherNumber or _id
    if (queryParams.search) {
      query.$or = [
        { voucherNumber: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    // Branch is an array in the schema, but we want to filter by single branch value, so we use $in operator
    if (queryParams.branch) {
      query.branch = { $in: [queryParams.branch] };
    }

    // Filter by createdBy
    if (
      queryParams.createdBy &&
      mongoose.Types.ObjectId.isValid(queryParams.createdBy)
    ) {
      query.createdBy = new mongoose.Types.ObjectId(queryParams.createdBy);
    }

    // Filter by category
    if (queryParams.category) {
      query.category = queryParams.category;
    }

    if (queryParams.paymentMethod) {
      query.paymentMethod = queryParams.paymentMethod;
    }

    // Filter by amount range
    if (
      queryParams.amountRange?.min !== undefined &&
      queryParams.amountRange?.max !== undefined
    ) {
      query.amount = {
        $gte: queryParams.amountRange.min,
        $lte: queryParams.amountRange.max,
      };
    }

    if (
      queryParams.expenseDateRange?.from ||
      queryParams.expenseDateRange?.to
    ) {
      query.expenseDate = {};

      if (queryParams.expenseDateRange.from) {
        query.expenseDate.$gte = new Date(queryParams.expenseDateRange.from);
      }

      if (queryParams.expenseDateRange.to) {
        query.expenseDate.$lte = new Date(queryParams.expenseDateRange.to);
      }
    }

    // Allowable sort fields
    const sortField = [
      "createdAt",
      "updatedAt",
      "amount",
      "paymentDate",
    ].includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType?.toLowerCase() === "asc" ? 1 : -1;

    // Fetch expense payments with pagination
    const [expensePayments, total, docsCount] = await Promise.all([
      Expense.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("createdBy", "phone roles email")
        .exec(),
      Expense.countDocuments(query),
      Expense.countDocuments(),
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
        message: "Expense payments fetched successfully!",
        data: expensePayments,
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
    // Check if expense payment exists
    const expense = await Expense.findById(idValidation.data._id)
      .populate("createdBy", "phone roles email")
      .exec();

    if (!expense) {
      return {
        error: {
          message: `expense payment not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `expense payment fetched successfully!`,
        data: expense,
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
    const expense = await Expense.findById(idValidation.data._id);

    if (!expense) {
      return {
        error: {
          message: `expense not found with provided ID!`,
        },
      };
    }

    // If already deleted, return success (idempotent)
    if (expense.isDeleted) {
      return {
        success: {
          success: true,
          message: `expense already deleted!`,
        },
      };
    }

    // isDeleted flag is on inside delete
    expense.isDeleted = true;
    expense.deletedAt = new Date();

    await expense.save();

    // Response
    return {
      success: {
        success: true,
        message: `expense deleted successfully!`,
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

export const restoreExpense = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check expense exists
    const expense = await Expense.findById(_id);

    if (!expense) {
      return {
        error: {
          message: `expense not found with provided ID!`,
        },
      };
    }

    if (!expense.isDeleted) {
      return { error: { message: "expense not deleted." } };
    }

    expense.isDeleted = false;
    expense.deletedAt = null;

    await expense.save();

    return {
      success: {
        success: true,
        message: "expense RESTORED successfully",
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
    const expense = await Expense.findById(idValidation.data._id);

    if (!expense) {
      return { error: { message: "expense not found!" } };
    }

    await expense.deleteOne();

    return {
      success: {
        success: true,
        message: "expense deleted successfully",
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
