import {
  classUpdateZ,
  classZ,
  IClass,
  IUpdateClass,
  mongoIdZ,
} from "@/validations";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { Class } from "../models/classes.model";
import pagination from "../utils/pagination";

export const register = async (body: IClass) => {
  // Safe Parse for better error handling
  const validData = classZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if class is already exists
    const isExistClass = await Class.findOne({
      className: validData.data.className,
    });

    if (isExistClass) {
      return {
        error: {
          message: "Sorry! This class already exists.",
          fields: [
            {
              name: "className",
              message: "class name must be unique",
            },
          ],
        },
      };
    }

    // Create class
    const newClass = new Class(validData.data);

    // Save class
    const docs = await newClass.save();

    return {
      success: {
        success: true,
        message: "Class created successfully",
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
  search: string;
}) => {
  try {
    // Build query
    const query: any = {};

    if (typeof queryParams.isActive === "boolean") {
      query.isActive = queryParams.isActive;
    }

    if (queryParams.search) {
      query.$or = [
        { className: { $regex: queryParams.search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "className"].includes(
      queryParams.sortBy,
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch classes
    const [classes, total] = await Promise.all([
      Class.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Class.countDocuments(query),
    ]);

    console.log("Query: ", query);

    // Pagination
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "Classes fetched successfully!",
        data: classes,
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
    // Check if Class exists
    const classData = await Class.findById(idValidation.data._id);

    if (!classData) {
      return {
        error: {
          message: `Class not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Class fetched successfully!`,
        data: classData,
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
  body: IUpdateClass;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = classUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body",
      ),
    };
  }

  try {
    // Check if Class exists
    const classData = await Class.findById(idValidation.data._id);

    if (!classData) {
      return {
        error: {
          message: "Class not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: classData,
        },
      };
    }

    // Update only provided fields
    Object.assign(classData, bodyValidation.data);
    const docs = await classData.save();

    return {
      success: {
        success: true,
        message: "Class updated successfully",
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
    const classData = await Class.findById(idValidation.data._id);

    if (!classData) {
      return {
        error: {
          message: `Class not found with provided ID!`,
        },
      };
    }

    // Delete Class
    // Inactive inside delete
    // await classData.deleteOne();
    classData.isActive = false;
    await classData.save();

    // Response
    return {
      success: {
        success: true,
        message: `Class deleted successfully!`,
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
