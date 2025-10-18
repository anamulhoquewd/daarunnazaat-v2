import { schemaValidationError } from "../error";
import { Class } from "../models/classes.model";
import pagination from "../utils/pagination";
import {
  classCreateZ,
  classUpdateZ,
  idSchemaZ,
  type TClassCreate,
} from "./../validations/zod";

export const register = async (body: TClassCreate) => {
  // Safe Parse for better error handling
  const validData = classCreateZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if class is already exists
    const isExistClass = await Class.findOne({ name: validData.data.name });

    if (isExistClass) {
      return {
        error: {
          message: "Sorry! This class already exists.",
          fields: [
            {
              name: "name",
              message: "Name must be unique",
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

  search: string;
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.search) {
      query.name = { $regex: queryParams.search, $options: "i" };
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "name"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "name";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch Classs
    const [Classs, total] = await Promise.all([
      Class.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Class.countDocuments(),
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
        message: "Classs fetched successfully!",
        data: Classs,
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
  body: {
    name: string;
    phone: string;
    email: string;
    address: string;
    designation: string; // পদবী
    join_date: Date;
    is_active: boolean;
    is_blocked: boolean;
  };
}) => {
  // Validate ID
  const idValidation = idSchemaZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = classUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
    };
  }

  try {
    // Check if Class exists
    const classData = await Class.findById(idValidation.data._id).select(
      "-password"
    );

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

          data: Class,
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
  const idValidation = idSchemaZ.safeParse({ _id: _id });
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
    await classData.deleteOne();

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
