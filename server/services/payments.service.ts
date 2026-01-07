import { schemaValidationError } from "../error";
import { Payment } from "../models/payments.model";
import pagination from "../utils/pagination";
import {
  idSchemaZ,
  paymentCreateZ,
  paymentUpdateZ,
  type TPaymentCreate,
} from "../../validations/zod";

export const register = async (body: TPaymentCreate) => {
  // Safe Parse for better error handling
  const validData = paymentCreateZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // check if payment is exist
    const isExistPaymentForThisMonth = await Payment.findOne({
      $and: [
        { month: validData.data.month },
        { year: validData.data.year },
        { student_id: validData.data.student_id },
      ],
    });

    if (isExistPaymentForThisMonth) {
      return {
        error: {
          message: `Sorry! This Payment already exists. - ${validData.data.month}, ${validData.data.year}`,
          fields: [
            {
              name: "month",
              message: "Student paid this month",
            },
          ],
        },
      };
    }

    // Create payment
    const payment = new Payment(validData.data);

    // Save payment
    const docs = await payment.save();

    return {
      success: {
        success: true,
        message: "payment created successfully",
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
  student_id: string;
  admin_id: string;
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.student_id) query.class_id = queryParams.student_id;
    if (queryParams.admin_id) query.gender = queryParams.admin_id;

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt"].includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch payments
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("admin_id", "name")
        .populate("student_id", "name")
        .exec(),
      Payment.countDocuments(),
    ]);

    // Pagination
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "payments fetched successfully!",
        data: payments,
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
  const idValidation = idSchemaZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // Check if payment exists
    const payment = await Payment.findById(idValidation.data._id);

    if (!payment) {
      return {
        error: {
          message: `payment not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `payment fetched successfully!`,
        data: payment,
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
}: {
  _id: string;
  body: {
    amount: number;
    month:
      | "january"
      | "february"
      | "march"
      | "april"
      | "may"
      | "june"
      | "july"
      | "august"
      | "september"
      | "october"
      | "november"
      | "december";
    year: number;
    paid_at: Date;
  };
}) => {
  // Validate ID
  const idValidation = idSchemaZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = paymentUpdateZ
    .omit({ student_id: true, admin_id: true })
    .safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
    };
  }

  try {
    // Check if payment exists
    const payment = await Payment.findById(idValidation.data._id);

    if (!payment) {
      return {
        error: {
          message: "payment not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: payment,
        },
      };
    }

    // Update only provided fields
    Object.assign(payment, bodyValidation.data);
    const docs = await payment.save();

    return {
      success: {
        success: true,
        message: "payment updated successfully",
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

export const deletes = async (_id: string) => {
  // Validate ID
  const idValidation = idSchemaZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const data = await Payment.findById(idValidation.data._id);

    if (!data) {
      return {
        error: {
          message: `payment not found with provided ID!`,
        },
      };
    }

    // Delete payment
    await data.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `payment deleted successfully!`,
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
