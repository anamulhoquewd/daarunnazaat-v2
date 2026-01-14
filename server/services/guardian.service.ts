import {
  BloodGroup,
  Gender,
  guardianUpdateZ,
  guardianZ,
  IGuardian,
  IUpdateGuardian,
  mongoIdZ,
  UserRole,
} from "@/validations";
import mongoose from "mongoose";
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
  // ✅ Transaction use করো - atomicity নিশ্চিত করতে
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
    if (user.role !== UserRole.GUARDIAN) {
      return {
        error: {
          message: "User role is not guardian",
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

    // 6️⃣ ✅ Update User profile field
    await User.findByIdAndUpdate(
      validData.data.userId,
      {
        profile: newGuardian._id,
        profileModel: "Guardian", // Dynamic ref এর জন্য
      },
      { session }
    );

    // ✅ Transaction commit
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
    // Session end করো
    session.endSession();
  }
};

export const gets = async (queryParams: {
  page: number;
  limit: number;
  sortBy: string;
  sortType: string;

  gender: Gender;
  bloodGroup: BloodGroup;
  search: string;
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.gender) query.gender = queryParams.gender;
    if (queryParams.bloodGroup) query.bloodGroup = queryParams.bloodGroup;

    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { nid: { $regex: queryParams.search, $options: "i" } },
        { guardianId: { $regex: queryParams.search, $options: "i" } },
        {
          birthCertificateNumber: { $regex: queryParams.search, $options: "i" },
        },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "firstName"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "firstName";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch guardian
    const [guardians, total] = await Promise.all([
      Guardian.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Guardian.countDocuments(query),
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
    const guardian = await Guardian.findById(idValidation.data._id);

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
  const bodyValidation = guardianUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
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
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: guardian,
        },
      };
    }

    // Update only provided fields
    Object.assign(guardian, bodyValidation.data);

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

export const updateMe = async ({
  userId,
  body,
}: {
  userId: string;
  body: IUpdateGuardian;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: userId });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = guardianUpdateZ
    .omit({
      userId: true,
    })
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
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: guardian,
        },
      };
    }

    // Update only provided fields
    Object.assign(guardian, bodyValidation.data);

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

    // TODO guardian delete korle user delete korbo ki korbo na.
    // Also delete associated user
    // await User.findByIdAndDelete(guardian.userId);

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

export const deactivate = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const guardian = await Guardian.findById(idValidation.data._id);

    if (!guardian) {
      return {
        error: {
          message: "Guardian not found with provided ID!",
        },
      };
    }

    // Also deactivate user
    await User.findByIdAndUpdate(guardian.userId, { isActive: false });

    return {
      success: {
        success: true,
        message: "Guardian deactivated successfully!",
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
    const guardian = await Guardian.findById(idValidation.data._id);

    if (!guardian) {
      return {
        error: {
          message: "Guardian not found with provided ID!",
        },
      };
    }

    // Also activate user
    await User.findByIdAndUpdate(guardian.userId, { isActive: true });

    return {
      success: {
        success: true,
        message: "Guardian activated successfully!",
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
