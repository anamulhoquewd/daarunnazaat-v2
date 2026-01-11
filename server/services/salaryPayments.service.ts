import {
  ISalaryPayment,
  ISalaryPaymentUpdate,
  mongoIdZ,
  PaymentMethod,
  salaryPaymentUpdateZ,
  salaryPaymentZ,
  TransactionType,
} from "@/validations";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { SalaryPayment } from "../models/salaryPayments.model";
import { generateSalaryReceiptNumber } from "../utils/string-generator";
import pagination from "../utils/pagination";
import { createTransactionLog } from "./transactions.service";

export const register = async (body: ISalaryPayment) => {
  // Safe Parse for better error handling
  const validData = salaryPaymentZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if salry is already exists
    const isExistSalary = await SalaryPayment.findOne({
      staffId: validData.data.staffId,
      month: validData.data.month,
      year: validData.data.year,
    });

    if (isExistSalary) {
      return {
        error: {
          message: "Sorry! Salary already paid.",
          fields: [
            {
              name: "month",
              message: "Salary already paid for this month",
            },
            {
              name: "year",
              message: "Salary already paid for this year",
            },
          ],
        },
      };
    }

    const receiptNumber = await generateSalaryReceiptNumber();

    // Create salry
    const salaryPayment = new SalaryPayment({
      ...validData.data,
      paidBy: body.paidBy,
      receiptNumber,
    });

    // Save salry
    const docs = await salaryPayment.save();

    // Create Transaction Log
    await createTransactionLog({
      transactionType: TransactionType.EXPENSE,
      referenceId: docs._id,
      referenceModel: "SalaryPayment",
      amount: docs.netSalary || docs.basicSalary + docs.bonus,
      description: `Salary paid for ${docs.month}/${docs.year}`,
      performedBy: body.paidBy,
      branch: docs.branch,
    });

    return {
      success: {
        success: true,
        message: "Salary payment created successfully",
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
  body: ISalaryPaymentUpdate;
  updatedByUserId: string;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = salaryPaymentUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
    };
  }

  try {
    // Check if salary exists
    const salary = await SalaryPayment.findById(idValidation.data._id);

    if (!salary) {
      return {
        error: { message: "Salary not found with the provided ID" },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing salary",
          data: salary,
        },
      };
    }

    // Save old values
    const oldNetSalary = salary.netSalary || 0;
    const oldStatus = salary.status;

    // Update only provided fields
    Object.assign(salary, bodyValidation.data);

    // Save salary
    const docs = await salary.save();

    // --- CREATE TRANSACTION LOGS ---

    const logs: Promise<any>[] = [];

    // NetSalary changed → Adjustment
    if (docs.netSalary !== oldNetSalary) {
      logs.push(
        createTransactionLog({
          transactionType: TransactionType.ADJUSTMENT,
          referenceId: docs._id,
          referenceModel: "SalaryPayment",
          amount: docs.netSalary! - oldNetSalary,
          description: `Salary adjusted for ${docs.month}/${docs.year}`,
          performedBy: updatedByUserId,
          branch: docs.branch,
        })
      );
    }

    // Status changed → Reversal / Paid / Adjusted
    if (docs.status !== oldStatus) {
      if (docs.status === "reversed") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.REVERSAL,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: oldNetSalary,
            description: `Salary reversed for ${docs.month}/${docs.year}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          })
        );
      } else if (docs.status === "paid") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.EXPENSE,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: docs.netSalary!,
            description: `Salary marked as paid for ${docs.month}/${docs.year}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          })
        );
      } else if (docs.status === "adjusted") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.ADJUSTMENT,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: docs.netSalary! - oldNetSalary,
            description: `Salary manually adjusted for ${docs.month}/${docs.year}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          })
        );
      }
    }

    await Promise.all(logs);

    return {
      success: {
        success: true,
        message: "Salary updated successfully",
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
  month?: string;
  year?: string;
  paymentMethod?: PaymentMethod;
  netSalaryRange?: { min?: number; max?: number };
  paidBy?: string;
  staffId?: string;
}) => {
  try {
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

    // Filter by staffId
    if (
      queryParams.staffId &&
      mongoose.Types.ObjectId.isValid(queryParams.staffId)
    ) {
      query.staffId = new mongoose.Types.ObjectId(queryParams.staffId);
    }

    // Filter by paidBy
    if (
      queryParams.paidBy &&
      mongoose.Types.ObjectId.isValid(queryParams.paidBy)
    ) {
      query.paidBy = new mongoose.Types.ObjectId(queryParams.paidBy);
    }

    // Filter by month & year
    if (queryParams.month) {
      query.month = parseInt(queryParams.month, 10);
    }
    if (queryParams.year) {
      query.year = parseInt(queryParams.year, 10);
    }

    // Filter by paymentMethod
    if (queryParams.paymentMethod) {
      query.paymentMethod = queryParams.paymentMethod;
    }

    // Filter by netSalary range
    if (queryParams.netSalaryRange) {
      const salaryFilter: any = {};
      if (queryParams.netSalaryRange.min != null) {
        salaryFilter.$gte = queryParams.netSalaryRange.min;
      }
      if (queryParams.netSalaryRange.max != null) {
        salaryFilter.$lte = queryParams.netSalaryRange.max;
      }
      if (Object.keys(salaryFilter).length > 0) {
        query.netSalary = salaryFilter;
      }
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "netSalary"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType?.toLowerCase() === "asc" ? 1 : -1;

    // Fetch salary payments with pagination
    const [salaryPayments, total] = await Promise.all([
      SalaryPayment.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      SalaryPayment.countDocuments(query),
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
        message: "Salary payments fetched successfully!",
        data: salaryPayments,
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
    // Check if Salary payment exists
    const salary = await SalaryPayment.findById(idValidation.data._id);

    if (!salary) {
      return {
        error: {
          message: `Salary payment not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Salary payment fetched successfully!`,
        data: salary,
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
    const salary = await SalaryPayment.findById(idValidation.data._id);

    if (!salary) {
      return {
        error: {
          message: `salary not found with provided ID!`,
        },
      };
    }

    // Delete salary
    await salary.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `salary deleted successfully!`,
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
