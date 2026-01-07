import { schemaValidationError } from "../error";
import { Student } from "../models/students.model";
import pagination from "../utils/pagination";
import {
  studentUpdateZ,
  idSchemaZ,
  studentCreateZ,
  type TStudentCreate,
} from "../../validations/zod";

export const register = async (body: TStudentCreate) => {
  // Safe Parse for better error handling
  const validData = studentCreateZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if Student already exists
    const isExistStudent = await Student.findOne({
      $and: [
        { id_card: validData.data.id_card },
        { roll: validData.data.roll },
        { class_id: validData.data.class_id },
      ],
    });

    if (isExistStudent) {
      return {
        error: {
          message: "Sorry! This ID card already exists.",
          fields: [
            {
              name: "id_card",
              message: "ID Card must be unique",
            },
          ],
        },
      };
    }

    // Create student
    const student = new Student(validData.data);

    // Save student
    const docs = await student.save();

    return {
      success: {
        success: true,
        message: "student created successfully",
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
  class_id: string;
  gender: "male" | "female";
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.search)
      query.name = { $regex: queryParams.search, $options: "i" };
    if (queryParams.class_id) query.class_id = queryParams.class_id;
    if (queryParams.gender) query.gender = queryParams.gender;

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "name", "roll"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "name";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch students
    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("class_id", "name teacher")
        .exec(),
      Student.countDocuments(),
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
        message: "students fetched successfully!",
        data: students,
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
    // Check if student exists
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return {
        error: {
          message: `student not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `student fetched successfully!`,
        data: student,
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
    roll: number;
    monthly_fee: number;
    id_card: string;
    class_id: string;
    guardian_name: string;
    guardian_phone: string;
    address: string;
    admission_date: string;
    date_of_birth: Date;
    gender: "male" | "female";
    is_active: boolean;
  };
}) => {
  // Validate ID
  const idValidation = idSchemaZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = studentUpdateZ.safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if student exists
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return {
        error: {
          message: "student not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: student,
        },
      };
    }

    // Update only provided fields
    Object.assign(student, validData.data);
    const docs = await student.save();

    return {
      success: {
        success: true,
        message: "student updated successfully",
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
    const data = await Student.findById(idValidation.data._id);

    if (!data) {
      return {
        error: {
          message: `student not found with provided ID!`,
        },
      };
    }

    // Delete student
    await data.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `student deleted successfully!`,
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
