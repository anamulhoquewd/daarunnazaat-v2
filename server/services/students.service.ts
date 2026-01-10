import {
  BatchType,
  Branch,
  Gender,
  IStudent,
  IUpdateStudent,
  mongoIdZ,
  mongoZ,
  studentUpdateZ,
  studentZ,
  UserRole,
} from "@/validations";
import { User } from "../models/users.model";
import { generateStudentId, stringGenerator } from "../utils/string-generator";
import { Guardian } from "../models/guardians.model";
import { Types } from "mongoose";
import { Student } from "../models/students.model";
import { schemaValidationError } from "../error";
import pagination from "../utils/pagination";
import mongoose from "mongoose";
import z from "zod";

export const createStudent = async (body: IStudent) => {
  // Safe Parse for better error handling
  const validData = studentZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }
  try {
    // 1️⃣ Check user exists
    const user = await User.findById(validData.data.userId);
    if (!user) {
      return {
        error: {
          message: "User not fount with the provided User ID",
        },
      };
    }

    // 2️⃣ Ensure role is student
    if (user.role !== UserRole.STUDENT) {
      return {
        error: {
          message: "User role is not student",
        },
      };
    }

    // 3️⃣ Check student already exists
    const existingStudent = await Student.findOne({
      userId: validData.data.userId,
    });

    if (existingStudent) {
      return {
        error: {
          message: "Student profile already exists for this user.",
        },
      };
    }

    // 4️⃣ Validate guardian
    const guardian = await Guardian.findById(validData.data.guardianId);
    if (!guardian) {
      return {
        error: {
          message: "Guardian not found provided Guardian ID",
        },
      };
    }

    const studentId = await generateStudentId();

    // 5️⃣ Create student
    const student = new Student({
      ...validData.data,
      studentId,
      sessionHistory: validData.data.sessionHistory || [],
    });

    // Ensure sessionHistory is initialized
    if (!student.sessionHistory) {
      student.sessionHistory = [];
    }

    student.sessionHistory.push({
      sessionId: validData.data.currentSessionId,
      classId: validData.data.classId,
      enrollmentDate: new Date(),
      completionDate: null,
      status: "ongoing",
    });

    // Save student
    const docs = await student.save();

    return {
      success: {
        success: true,
        message: "Student created successfully",
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
  classId: string;
  branch: Branch;
  sessionId: string;
  gender: Gender;
  isResidential?: boolean;
  guardianId: string;
  currentSessionId: string;
  batchType: BatchType;
  admissionDateRange: {
    from: string | Date | undefined;
    to: string | Date | undefined;
  };
}) => {
  try {
    // Build query
    const query: any = {};
    if (typeof queryParams.isResidential === "boolean") {
      query.isResidential = queryParams.isResidential;
    }

    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { studentId: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    if (queryParams.classId) query.classId = queryParams.classId;
    if (queryParams.batchType) query.batchType = queryParams.batchType;
    if (queryParams.branch) query.branch = queryParams.branch;
    if (queryParams.sessionId) query.currentSessionId = queryParams.sessionId;
    if (queryParams.guardianId) query.guardianId = queryParams.guardianId;
    if (queryParams.gender) query.gender = queryParams.gender;
    if (queryParams.isResidential !== undefined)
      query.isResidential = queryParams.isResidential;

    if (
      queryParams.admissionDateRange &&
      queryParams.admissionDateRange.from &&
      queryParams.admissionDateRange.to
    ) {
      // Length should be 2
      query.admissionDate = {};
      if (queryParams.admissionDateRange.from)
        query.admissionDate.$gte = new Date(
          queryParams.admissionDateRange.from
        );
      if (queryParams.admissionDateRange.to)
        query.admissionDate.$lte = new Date(queryParams.admissionDateRange.to);
      if (Object.keys(query.admissionDate).length === 0)
        delete query.admissionDate;
    }

    // Allowable sort fields
    const sortField = [
      "createdAt",
      "updatedAt",
      "firstName",
      "studentId",
      "admissionDate",
    ].includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";

    const sortDirection = queryParams.sortType.toLowerCase() === "asc" ? 1 : -1;

    // Fetch students
    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .populate("classId", "className monthlyFee")
        .populate("userId", "phone email alternativePhone whatsApp isBlocked")
        .populate({
          path: "guardianId",
          select: "firstName lastName userId",
          populate: {
            path: "userId",
            select: "phone",
          },
        })
        .populate("currentSessionId", "sessionName")
        .exec(),
      Student.countDocuments(query),
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
        message: "Students fetched successfully!",
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
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    // Find student with populated data
    const student = await Student.findById(idValidation.data._id)
      .populate("userId")
      .populate("guardianId")
      .populate("classId")
      .populate("currentSessionId")
      .populate("sessionHistory.sessionId")
      .populate("sessionHistory.classId");

    if (!student) {
      return {
        error: {
          message: "Student not found with provided ID!",
        },
      };
    }

    return {
      success: {
        success: true,
        message: "Student fetched successfully!",
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
  body: IUpdateStudent;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  // Validate Body
  const validData = studentUpdateZ
    .omit({ userId: true, studentId: true, guardianId: true })
    .safeParse(body);
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
          message: "Student not found with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing student",
          data: student,
        },
      };
    }

    // Don't allow updating critical fields
    const restrictedFields = ["userId", "studentId", "guardianId"];
    restrictedFields.forEach((field) => delete (validData.data as any)[field]);

    // Update only provided fields
    Object.assign(student, validData.data);
    const docs = await student.save();

    return {
      success: {
        success: true,
        message: "Student updated successfully",
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
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return {
        error: {
          message: "Student not found with provided ID!",
        },
      };
    }

    // Delete student
    await student.deleteOne();

    // TODO student delete korle user delete korbo ki korbo na.
    // Also delete associated user
    // await User.findByIdAndDelete(student.userId);

    return {
      success: {
        success: true,
        message: "Student deleted successfully!",
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

export const deactivate = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return {
        error: {
          message: "Student not found with provided ID!",
        },
      };
    }

    // Also deactivate user
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    return {
      success: {
        success: true,
        message: "Student deactivated successfully!",
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

export const activate = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return {
        error: {
          message: "Student not found with provided ID!",
        },
      };
    }

    // Also activate user
    await User.findByIdAndUpdate(student.userId, { isActive: true });

    return {
      success: {
        success: true,
        message: "Student activated successfully!",
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

export const promote = async ({
  _id,
  body,
}: {
  _id: string;
  body: { newSessionId: string; newClassId: string };
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  const validData = z
    .object({
      newSessionId: mongoZ,
      newClassId: mongoZ,
    })
    .safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const student = await Student.findById(idValidation.data._id).session(
      session
    );

    if (!student) {
      await session.abortTransaction();
      return {
        error: {
          message: "Student not found",
        },
      };
    }

    // Initialize sessionHistory if undefined
    if (!student.sessionHistory) {
      student.sessionHistory = [];
    }

    // Complete current session
    const currentHistory = student.sessionHistory.find(
      (h) => h.sessionId.toString() === student.currentSessionId.toString()
    );

    if (currentHistory) {
      currentHistory.completionDate = new Date();
      currentHistory.status = "completed";
    }

    // Add new session to history
    student.sessionHistory.push({
      sessionId: new Types.ObjectId(validData.data.newSessionId),
      classId: new Types.ObjectId(validData.data.newClassId),
      enrollmentDate: new Date(),
      completionDate: null,
      status: "ongoing",
    });

    // Update current session and class
    student.currentSessionId = new Types.ObjectId(validData.data.newSessionId);
    student.classId = new Types.ObjectId(validData.data.newClassId);

    await student.save({ session });
    await session.commitTransaction();

    return {
      success: {
        success: true,
        message: "Student promoted successfully",
        data: student,
      },
    };
  } catch (error: any) {
    await session.abortTransaction();
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  } finally {
    session.endSession();
  }
};
