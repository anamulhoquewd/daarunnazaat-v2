import {
  Branch,
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
import { Staff } from "../models/staffs.model";
import pagination from "../utils/pagination";
import { generateSalaryReceiptNumber } from "../utils/string-generator";
import { createTransactionLog } from "./transactions.service";
import { Salary } from "../models/salaryPayments.model";

export const register = async (body: ISalaryPayment) => {
  // Safe Parse for better error handling
  const validData = salaryPaymentZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    let status: "paid" | "pending" | "partial" = "pending";

    const staff = await Staff.findById(validData.data.staffId);

    if (!staff || staff.branch !== validData.data.branch) {
      return { error: { message: "Invalid staff on this branch or ID" } };
    }

    // Check if salry is already exists
    const isExistSalary = await Salary.findOne({
      staffId: validData.data.staffId,
      period: validData.data.period,
    });

    if (staff.baseSalary === 0 && validData.data.bonus === 0) {
      return {
        error: {
          message:
            "Invalid salary values. Basic salary and bonus cannot both be zero.",
        },
      };
    }

    // Update status
    if (validData.data.baseSalary === 0) {
      status = "pending";
    } else if (validData.data.baseSalary! < staff.baseSalary) {
      status = "partial";
    } else {
      status = "paid";
    }

    if (isExistSalary) {
      return {
        error: {
          message: "Sorry! already have a record of salaries.",
          fields: [
            {
              name: "period",
              message: "We already have a record of salaries for this period.",
            },
          ],
        },
      };
    }

    const receiptNumber = await generateSalaryReceiptNumber();

    // Create salry
    const salaryPayment = new Salary({
      ...validData.data,
      status,
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
      amount: docs.netSalary || docs.baseSalary + docs.bonus,
      description: `Salary paid for ${docs.period}`,
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
        "Invalid request body",
      ),
    };
  }

  try {
    // Check if salary exists
    const salary = await Salary.findById(idValidation.data._id);

    if (!salary) {
      return {
        error: { message: "Salary not found with the provided ID" },
      };
    }

    // check if period is being updated and if it already exists for the staff
    let existingSalary: ISalaryPayment | null = null;

    if (
      bodyValidation.data.period &&
      bodyValidation.data.period !== salary.period
    ) {
      existingSalary = await Salary.findOne({
        staffId: salary.staffId,
        period: bodyValidation.data.period,
      });
    }

    if (existingSalary) {
      return {
        error: {
          message:
            "A salary record for this period already exists for the staff.",
          fields: [
            {
              name: "period",
              message: "We already have a record of salaries for this period.",
            },
          ],
        },
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

    let status: "paid" | "pending" | "partial" = salary.status || "pending";

    // Update status based on baseSalary
    if (salary.baseSalary === 0) {
      status = "pending";
    } else if (salary.baseSalary < salary.baseSalary) {
      status = "partial";
    } else {
      status = "paid";
    }

    // Update only provided fields
    Object.assign(salary, { ...bodyValidation.data, status });

    // Save salary
    const docs = await salary.save();

    // --- CREATE TRANSACTION LOGS ---

    const logs: Promise<any>[] = [];

    // Status changed → Reversal / Paid / Adjusted
    if (docs.status !== oldStatus) {
      if (docs.status === "partial" && oldStatus === "paid") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.REVERSAL,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: oldNetSalary,
            description: `Salary reversed for ${docs.period}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          }),
        );
      } else if (docs.status === "paid") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.EXPENSE,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: docs.netSalary!,
            description: `Salary marked as paid for ${docs.period}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          }),
        );
      } else if (docs.status === "partial") {
        logs.push(
          createTransactionLog({
            transactionType: TransactionType.ADJUSTMENT,
            referenceId: docs._id,
            referenceModel: "SalaryPayment",
            amount: docs.netSalary! - oldNetSalary,
            description: `Salary manually updated for ${docs.period}`,
            performedBy: updatedByUserId,
            branch: docs.branch,
          }),
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
  period?: string;
  paymentMethod?: PaymentMethod;
  netSalaryRange?: { min?: number; max?: number };
  paidBy?: string;
  staffId?: string;
  paymentDateRange?: {
    from?: string | Date;
    to?: string | Date;
  };
  branch: Branch;
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

    // Filter by branch
    if (queryParams.branch) {
      query.branch = queryParams.branch;
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

    // Filter by period
    if (queryParams.period) {
      query.period = queryParams.period;
    }

    if (queryParams.paymentMethod) {
      query.paymentMethod = queryParams.paymentMethod;
    }

    // Filter by netSalary range
    if (
      queryParams.netSalaryRange?.min !== undefined &&
      queryParams.netSalaryRange?.max !== undefined
    ) {
      query.baseSalary = {
        $gte: queryParams.netSalaryRange.min,
        $lte: queryParams.netSalaryRange.max,
      };
    }

    if (
      queryParams.paymentDateRange?.from ||
      queryParams.paymentDateRange?.to
    ) {
      query.paymentDate = {};

      if (queryParams.paymentDateRange.from) {
        query.paymentDate.$gte = new Date(queryParams.paymentDateRange.from);
      }

      if (queryParams.paymentDateRange.to) {
        query.paymentDate.$lte = new Date(queryParams.paymentDateRange.to);
      }
    }

    // Allowable sort fields
    const sortField = [
      "createdAt",
      "updatedAt",
      "netSalary",
      "paymentDate",
    ].includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType?.toLowerCase() === "asc" ? 1 : -1;

    // Fetch salary payments with pagination
    const [salaryPayments, total, docsCount] = await Promise.all([
      Salary.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate(
          "staffId",
          "fullName gender designation baseSalary branch staffId whtasApp",
        )
        .populate("paidBy", "phone")
        .exec(),
      Salary.countDocuments(query),
      Salary.countDocuments(),
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
    const salary = await Salary.findById(idValidation.data._id)
      .populate("staffId")
      .populate("paidBy", "phone roles")
      .exec();

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

export const salaryFindByStaffId = async (staffId: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: staffId });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // Check if Salary payment exists
    const salary = await Salary.find({ staffId: idValidation.data._id });

    if (!salary || salary.length === 0) {
      return {
        error: {
          message: `Salary payment not found with provided Staff ID!`,
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

export const deleteFlag = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const salary = await Salary.findById(idValidation.data._id);

    if (!salary) {
      return {
        error: {
          message: `salary not found with provided ID!`,
        },
      };
    }

    // isDeleted flag is on inside delete
    salary.isDeleted = true;
    salary.deletedAt = new Date();

    await salary.save();

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

export const restoreSalary = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check salary exists
    const salary = await Salary.findById(_id);

    if (!salary) {
      return {
        error: {
          message: `salary not found with provided ID!`,
        },
      };
    }

    if (!salary.isDeleted) {
      return { error: { message: "salary not deleted." } };
    }

    salary.isDeleted = false;
    salary.deletedAt = null;

    return {
      success: {
        success: true,
        message: "salary RESTORED successfully",
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
    const salary = await Salary.findById(idValidation.data._id);

    if (!salary) {
      return { error: { message: "salary not found!" } };
    }

    await salary.deleteOne();

    return {
      success: {
        success: true,
        message: "salary deleted successfully",
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
