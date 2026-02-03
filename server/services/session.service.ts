import {
  BatchType,
  Branch,
  ISession,
  IUpdateSession,
  mongoIdZ,
  sessionUpdateZ,
  sessionZ,
} from "@/validations";
import { schemaValidationError } from "../error";
import { Session } from "../models/sessions.model";
import pagination from "../utils/pagination";
import mongoose from "mongoose";

export const register = async (body: ISession) => {
  // Safe Parse for better error handling
  const validData = sessionZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if Session is already exists
    const isExistSession = await Session.findOne({
      sessionName: validData.data.sessionName,
    });

    if (isExistSession) {
      return {
        error: {
          message: "Sorry! This Session already exists.",
          fields: [
            {
              name: "name",
              message: "session name must be unique",
            },
          ],
        },
      };
    }

    // Create session
    const session = new Session(validData.data);

    // Save session
    const docs = await session.save();

    return {
      success: {
        success: true,
        message: "Session created successfully",
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

  isActive?: boolean;
  batchType: BatchType;
  search: string;
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.batchType) query.batchType = queryParams.batchType;
    if (typeof queryParams.isActive === "boolean") {
      query.isActive = queryParams.isActive;
    }

    if (queryParams.search) {
      query.$or = [
        { sessionName: { $regex: queryParams.search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "sessionName"].includes(
      queryParams.sortBy,
    )
      ? queryParams.sortBy
      : "sessionName";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch sessions
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Session.countDocuments(query),
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
        message: "sessions fetched successfully!",
        data: sessions,
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
    // Check if Session exists
    const session = await Session.findById(idValidation.data._id);

    if (!session) {
      return {
        error: {
          message: `Session not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Session fetched successfully!`,
        data: session,
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
  body: IUpdateSession;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = sessionUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body",
      ),
    };
  }

  try {
    // Check if Session exists
    const session = await Session.findById(idValidation.data._id);

    if (!session) {
      return {
        error: {
          message: "Session not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: session,
        },
      };
    }

    // Update only provided fields
    Object.assign(session, bodyValidation.data);
    const docs = await session.save();

    return {
      success: {
        success: true,
        message: "Session updated successfully",
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
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const session = await Session.findById(idValidation.data._id);

    if (!session) {
      return {
        error: {
          message: `Session not found with provided ID!`,
        },
      };
    }

    // Delete Session
    await session.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `Session deleted successfully!`,
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
