import {
  BatchType,
  Branch,
  FeeType,
  Gender,
  IStudent,
  IUpdateStudent,
  IUser,
  mongoIdZ,
  mongoZ,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  studentUpdateZ,
  studentZ,
  TransactionType,
} from "@/validations";
import mongoose, { PipelineStage, Types } from "mongoose";
import z from "zod";
import { schemaValidationError } from "../error";
import { FeeCollection } from "../models/feeCollections.model";
import { Guardian } from "../models/guardians.model";
import { Session } from "../models/sessions.model";
import { Student } from "../models/students.model";
import pagination from "../utils/pagination";
import {
  generateFeeReceiptNumber,
  generateStudentId,
} from "../utils/string-generator";
import { createTransactionLog } from "./transactions.service";

export const createStudent = async ({
  body,
  authUser,
}: {
  authUser: IUser;
  body: IStudent;
}) => {
  // Safe Parse for better error handling
  const validData = studentZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate guardian
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

    // Validate currentSession
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

    // Create student
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

    // ✅ **CREATE ADMISSION FEE COLLECTION**
    const admissionFeeResult = await createAdmissionFee({
      student: newStudent,
      authUser,
      session,
      paymentMethod: validData.data.paymentMethod,
      receivedAmount: validData.data.receivedAmount,
      remarks: validData.data.remarks,
      paymentSource: validData.data.paymentSource,
    });

    if (!admissionFeeResult.success) {
      // যদি admission fee collection fail করে তাহলে rollback
      await session.abortTransaction();
      return {
        error: {
          message: "Failed to create admission fee collection",
        },
      };
    }

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

    if (error.code === 11000) {
      // duplicate studentId
      throw new Error("Student ID conflict. Please retry.");
    }

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

// Helper Function: Create Admission Fee
export const createAdmissionFee = async ({
  student,
  authUser,
  session,
  receivedAmount,
  paymentMethod,
  remarks,
  paymentSource,
}: {
  student: IStudent & Document;
  authUser: IUser;
  session: any; // mongoose session
  receivedAmount: number;
  paymentMethod: PaymentMethod;
  remarks?: string;
  paymentSource: PaymentSource;
}) => {
  try {
    const receiptNumber = await generateFeeReceiptNumber();

    // Previous balance 0 student
    const previousDue = 0;
    const previousAdvance = 0;
    const baseAmount = student.admissionFee;

    // payableAmount = baseAmount + previousDue - previousAdvance
    const payableAmount = baseAmount + previousDue - previousAdvance;

    // ===== CALCULATION =====
    let dueAmount = 0;
    let advanceAmount = 0;
    let paymentStatus = PaymentStatus.PARTIAL;

    if (receivedAmount >= payableAmount) {
      paymentStatus = PaymentStatus.PAID;
      advanceAmount = receivedAmount - payableAmount;
      dueAmount = 0;
    } else if (receivedAmount === 0) {
      paymentStatus = PaymentStatus.DUE;
      dueAmount = payableAmount - receivedAmount;
      advanceAmount = 0;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
      dueAmount = payableAmount - receivedAmount;
      advanceAmount = 0;
    }

    // Create admission fee collection
    const admissionFee = new FeeCollection({
      studentId: student._id,
      feeType: FeeType.ADMISSION,
      sessionId: student.currentSessionId,
      branch: student.branch,
      collectedBy: authUser._id,
      paymentDate: student.admissionDate,

      receiptNumber,
      baseAmount,
      payableAmount,
      receivedAmount,
      dueAmount,
      advanceAmount,
      paymentStatus,

      paymentMethod,
      remarks,
      paymentSource,
    });

    // Save with session (with transaction)
    const savedFee = await admissionFee.save({ session });

    // Update student feeBalance
    await Student.findByIdAndUpdate(
      student._id,
      {
        $set: {
          "feeBalance.admissionFee.due": dueAmount,
          "feeBalance.admissionFee.advance": advanceAmount,
        },
      },
      { session, new: true },
    );

    // Create Transaction Log (always - even if receivedAmount is 0)
    await createTransactionLog({
      transactionType: TransactionType.INCOME,
      referenceId: savedFee._id,
      referenceModel: "FeeCollection",
      amount: receivedAmount,
      description: `Admission fee collected for student ${student.studentId}`,
      performedBy: authUser._id,
      branch: student.branch,
    });

    return { success: true, data: savedFee };
  } catch (error: any) {
    throw new Error(`Admission fee collection failed: ${error.message}`);
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
        { fullName: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { nid: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
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
      "fullName",
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

    // const result = await Student.aggregate(pipeline);

    const [result, docsCount] = await Promise.all([
      Student.aggregate(pipeline),
      Student.countDocuments(),
    ]);

    const students = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    const paginationInfo = pagination({
      page,
      limit,
      total,
      totalDocs: docsCount,
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

  // Validate Body. Omit studentId and guardianId to prevent updates to these critical fields
  const validData = studentUpdateZ
    .omit({ studentId: true, guardianId: true })
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
    const restrictedFields = ["studentId", "guardianId"];
    restrictedFields.forEach((field) => delete (validData.data as any)[field]);

    // Update only provided fields
    Object.assign(student, validData.data);
    const docs = await student.save();

    const populatedStudent = await Student.findById(docs._id)
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

export const deleteStudent = async (_id: string) => {
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

    if (student.isDeleted) {
      return { error: { message: "student already deleted." } };
    }

    student.isDeleted = true;
    student.deletedAt = new Date();

    await student.save();

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

export const restoreStudent = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check student exists
    const student = await Student.findById(_id);

    if (!student) {
      return {
        error: {
          message: `student not found with provided ID!`,
        },
      };
    }

    if (!student.isDeleted) {
      return { error: { message: "student not deleted." } };
    }

    student.isDeleted = false;
    student.deletedAt = null;

    await student.save();

    return {
      success: {
        success: true,
        message: "student RESTORED successfully",
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

    if (!student.isActive) {
      return {
        error: {
          message: "Student already deactivated.",
        },
      };
    }

    student.isActive = false;
    await student.save();

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

    if (student.isActive) {
      return {
        error: {
          message: "Student already active.",
        },
      };
    }

    student.isActive = true;
    await student.save();

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

export const blockStudent = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return { error: { message: "student not found!" } };
    }

    if (student.isBlocked) {
      return { error: { message: "student already blocked." } };
    }

    student.isBlocked = true;
    student.blockedAt = new Date();

    await student.save();

    return {
      success: {
        success: true,
        message: "student blocked successfully",
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

export const unblockStudent = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check student exists
    const student = await Student.findById(_id);

    if (!student) {
      return {
        error: {
          message: `student not found with provided ID!`,
        },
      };
    }

    if (!student.isBlocked) {
      return { error: { message: "student NOT blocked." } };
    }

    student.isBlocked = false;
    student.blockedAt = null;

    await student.save();

    return {
      success: {
        success: true,
        message: "student NOT BLOCKED successfully",
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

// Permanent delete (hard delete) - use with caution
export const permanentDelete = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const student = await Student.findById(idValidation.data._id);

    if (!student) {
      return { error: { message: "student not found!" } };
    }

    await student.deleteOne();

    return {
      success: {
        success: true,
        message: "student deleted successfully",
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
