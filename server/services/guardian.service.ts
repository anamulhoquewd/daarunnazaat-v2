import {
  guardianUpdateZ,
  guardianZ,
  IGuardian,
  IUpdateGuardian,
  mongoIdZ,
  UserRole,
} from "@/validations";
import mongoose, { PipelineStage } from "mongoose";
import { schemaValidationError } from "../error";
import { Guardian } from "../models/guardians.model";
import { User } from "../models/users.model";
import pagination from "../utils/pagination";
import { generateGuardianId } from "../utils/string-generator";

export const createGuardian = async (body: IGuardian) => {
  // Safe Parse for better error handling
  const validData = guardianZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check user exists
    const user = await User.findById(validData.data.userId);
    if (!user) {
      return {
        error: {
          message: "User not fount with the provided User ID",
        },
      };
    }

    // Ensure role is guardian
    if (!user.roles.includes(UserRole.GUARDIAN)) {
      return {
        error: {
          message:
            "User not have to guardian tole, please assign guardian role to the user first",
        },
      };
    }

    // Check guardian already exists
    const existingGuardian = await Guardian.findOne({
      userId: validData.data.userId,
    });

    if (existingGuardian) {
      return {
        error: {
          message: "Guaridan profile already exists for this user.",
        },
      };
    }

    const guardianId = await generateGuardianId();

    // Create guardian
    const guardian = new Guardian({
      ...validData.data,
      guardianId,
    });

    // Save guardian
    const newGuardian = await guardian.save();

    // Transaction commit
    await session.commitTransaction();

    return {
      success: {
        success: true,
        message: "Guardian created successfully",
        data: newGuardian,
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
  gender?: string;
  search?: string;
}) => {
  try {
    const matchStage: any = {};

    /* ------------------ FILTERS ------------------ */
    if (queryParams.gender) matchStage.gender = queryParams.gender;

    /* ------------------ SEARCH ------------------ */
    if (queryParams.search) {
      const search = queryParams.search;

      matchStage.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { nid: { $regex: search, $options: "i" } },
        { guardianId: { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        matchStage.$or.push({
          _id: new mongoose.Types.ObjectId(search),
        });
      }
    }

    /* ------------------ SORT ------------------ */
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "fullName",
      "guardianId",
    ];
    const sortField = allowedSortFields.includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "fullName";

    const sortDirection =
      queryParams.sortType?.toLowerCase() === "asc" ? 1 : -1;

    const skip = (queryParams.page - 1) * queryParams.limit;
    const limit = queryParams.limit;

    /* ------------------ AGGREGATION PIPELINE ------------------ */
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "users", // User collection name
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: matchStage },
      { $sort: { [sortField]: sortDirection } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const [result, docsCount] = await Promise.all([
      Guardian.aggregate(pipeline),
      Guardian.countDocuments(),
    ]);

    const guardians = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    /* ------------------ PAGINATION ------------------ */
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
      totalDocs: docsCount,
    });

    return {
      success: {
        success: true,
        message: "Guardians fetched successfully!",
        data: guardians,
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
    // Check if guardian exists
    const guardian = await Guardian.findById(idValidation.data._id).populate(
      "userId",
    );

    if (!guardian) {
      return {
        error: {
          message: `Guardian not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Guardian fetched successfully!`,
        data: guardian,
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
  body: IUpdateGuardian;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = guardianUpdateZ.omit({ userId: true }).safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if Guardian exists
    const guardian = await Guardian.findById(idValidation.data._id);

    if (!guardian) {
      return {
        error: {
          message: "Guardian not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: guardian,
        },
      };
    }

    // Update only provided fields
    Object.assign(guardian, validData.data);

    const docs = await guardian.save();

    return {
      success: {
        success: true,
        message: "Guardian updated successfully",
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
    const guardian = await Guardian.findById(idValidation.data._id);

    if (!guardian) {
      return {
        error: {
          message: `Guardian not found with provided ID!`,
        },
      };
    }

    // Delete Guardian
    await guardian.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `Guardian deleted successfully!`,
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

