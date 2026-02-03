import { PipelineStage } from "mongoose";
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
import mongoose, { Types } from "mongoose";
import z from "zod";
import { schemaValidationError } from "../error";
import { Guardian } from "../models/guardians.model";
import { Student } from "../models/students.model";
import { User } from "../models/users.model";
import pagination from "../utils/pagination";
import { generateStudentId } from "../utils/string-generator";
import { Session } from "../models/sessions.model";

export const createStudent = async (body: IStudent) => {
  // Safe Parse for better error handling
  const validData = studentZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  // ✅ Transaction use করো - atomicity নিশ্চিত করতে
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Check user exists
    const user = await User.findById(validData.data.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return {
        error: {
          message: "User not found with the provided User ID",
        },
      };
    }

    // 2️⃣ Ensure role is student
    if (user.role !== UserRole.STUDENT) {
      await session.abortTransaction();
      return {
        error: {
          message: "User role is not student",
        },
      };
    }

    // 3️⃣ Check student already exists
    const existingStudent = await Student.findOne({
      userId: validData.data.userId,
    }).session(session);

    if (existingStudent) {
      await session.abortTransaction();
      return {
        error: {
          message: "Student profile already exists for this user.",
          fields: [
            {
              name: "userId",
              message: "Student profile already exists for this user.",
            },
          ],
        },
      };
    }

    // 4️⃣ Validate guardian
    const guardian = await Guardian.findById(validData.data.guardianId).session(
      session,
    );
    if (!guardian) {
      await session.abortTransaction();
      return {
        error: {
          message: "Guardian not found with provided Guardian ID",
        },
      };
    }

    // 4️⃣ Validate currentSession
    const currentSession = await Session.findOne({
      _id: validData.data.currentSessionId,
      isActive: true,
      batchType: validData.data.batchType,
    }).session(session);
    if (!currentSession) {
      await session.abortTransaction();
      return {
        error: {
          message:
            "Session not found,  inactive Session or do not match 'batchType'",
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

    // Save new student with session
    const newStudent = await student.save({ session });

    // 6️⃣ ✅ Update User profile field
    await User.findByIdAndUpdate(
      validData.data.userId,
      {
        profile: newStudent._id,
        profileModel: "Student", // Dynamic reference
      },
      { session },
    );

    // ✅ Transaction commit
    await session.commitTransaction();

    return {
      success: {
        success: true,
        message: "Student created successfully",
        data: newStudent,
      },
    };
  } catch (error: any) {
    // Error হলে rollback
    await session.abortTransaction();

    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  } finally {
    // Session end
    session.endSession();
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
    const {
      page,
      limit,
      sortBy,
      sortType,
      search,
      classId,
      branch,
      sessionId,
      guardianId,
      batchType,
      gender,
      isResidential,
      admissionDateRange,
    } = queryParams;

    const pipeline: PipelineStage[] = [];

    /* =========================
       LOOKUPS
    ========================= */

    // user
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });
    pipeline.push({ $unwind: "$user" });

    // class
    pipeline.push({
      $lookup: {
        from: "classes",
        localField: "classId",
        foreignField: "_id",
        as: "class",
      },
    });
    pipeline.push({
      $unwind: { path: "$class", preserveNullAndEmptyArrays: true },
    });

    // guardian
    pipeline.push({
      $lookup: {
        from: "guardians",
        let: { guardianId: "$guardianId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$guardianId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: "guardian",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$guardian",
        preserveNullAndEmptyArrays: true,
      },
    });

    /* =========================
       MATCH (FILTERS)
    ========================= */

    const matchStage: any = {};

    if (classId) matchStage.classId = new mongoose.Types.ObjectId(classId);
    if (branch) matchStage.branch = branch;
    if (sessionId)
      matchStage.currentSessionId = new mongoose.Types.ObjectId(sessionId);
    if (guardianId)
      matchStage.guardianId = new mongoose.Types.ObjectId(guardianId);
    if (batchType) matchStage.batchType = batchType;
    if (gender) matchStage.gender = gender;
    if (typeof isResidential === "boolean")
      matchStage.isResidential = isResidential;

    // Admission date range
    if (admissionDateRange?.from && admissionDateRange?.to) {
      matchStage.admissionDate = {};
      if (admissionDateRange.from)
        matchStage.admissionDate.$gte = new Date(admissionDateRange.from);
      if (admissionDateRange.to)
        matchStage.admissionDate.$lte = new Date(admissionDateRange.to);
    }

    // SEARCH (root + nested)
    if (search) {
      matchStage.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { nid: { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } },
      ];
    }

    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage });
    }

    /* =========================
       SORT
    ========================= */

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "firstName",
      "studentId",
      "admissionDate",
    ];

    const finalSortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortDirection = sortType?.toLowerCase() === "asc" ? 1 : -1;

    pipeline.push({
      $sort: { [finalSortField]: sortDirection },
    });

    /* =========================
       PAGINATION + TOTAL
    ========================= */

    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    });

    const result = await Student.aggregate(pipeline);

    const students = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    const paginationInfo = pagination({
      page,
      limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "Students fetched successfully!",
        data: students,
        pagination: paginationInfo,
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

    const populatedStudent = await Student.findById(docs._id)
      .populate("userId")
      .populate("guardianId")
      .populate("classId")
      .populate("currentSessionId")
      .populate("sessionHistory.sessionId")
      .populate("sessionHistory.classId");

    return {
      success: {
        success: true,
        message: "Student updated successfully",
        data: populatedStudent,
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

export const updateMe = async ({
  userId,
  body,
}: {
  userId: string;
  body: IUpdateStudent;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: userId });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  // Validate Body
  const validData = studentUpdateZ
    .omit({
      classId: true,
      admissionDate: true,
      payableAdmissionFee: true,
      admissionFee: true,
      batchType: true,
      branch: true,
      currentSessionId: true,
      guardianId: true,
      isMealIncluded: true,
      isResidential: true,
      mealFee: true,
      monthlyFee: true,
      passoutDate: true,
      residentialFee: true,
      sessionHistory: true,
      studentId: true,
      userId: true,
      nid: true,
      birthCertificateNumber: true,
    })
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

// Promote to new class and new session
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
      session,
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
      (h: any) =>
        h.sessionId.toString() === student.currentSessionId.toString(),
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
