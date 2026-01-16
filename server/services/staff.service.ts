import {
  BloodGroup,
  Branch,
  Gender,
  IStaff,
  IUpdateStaff,
  mongoIdZ,
  staffUpdateZ,
  staffZ,
  UserRole,
} from "@/validations";
import mongoose, { PipelineStage } from "mongoose";
import { schemaValidationError } from "../error";
import { Staff } from "../models/staffs.model";
import { User } from "../models/users.model";
import pagination from "../utils/pagination";
import { generateStaffId } from "../utils/string-generator";

export const createStaff = async (body: IStaff) => {
  const validData = staffZ.safeParse(body);

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

    // Ensure role is staff
    if (
      user.role !== UserRole.STAFF &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.SUPER_ADMIN
    ) {
      return {
        error: {
          message: "User role is not STAFF/SUPER_ADMIN/ADMIN",
        },
      };
    }

    // Check staff already exists
    const existingStaff = await Staff.findOne({
      userId: validData.data.userId,
    });

    if (existingStaff) {
      return {
        error: {
          message: "Staff profile already exists for this user.",
        },
      };
    }

    const staffId = await generateStaffId();

    // Create staff
    const staff = new Staff({
      ...validData.data,
      staffId,
    });

    // Save staff
    const newStaff = await staff.save();

    // 6️⃣ ✅ Update User profile field
    await User.findByIdAndUpdate(
      validData.data.userId,
      {
        profile: newStaff._id,
        profileModel: "Staff", // Dynamic ref এর জন্য
      },
      { session }
    );

    // ✅ Transaction commit
    await session.commitTransaction();

    return {
      success: {
        success: true,
        message: "Staff created successfully",
        data: newStaff,
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
  gender?: Gender;
  branch?: Branch;
  search?: string;
  joinDateRange?: {
    from?: string | Date;
    to?: string | Date;
  };
  basicSalaryRange?: {
    min?: number;
    max?: number;
  };
}) => {
  try {
    const matchStage: any = {};

    /* ------------------ BASIC FILTERS ------------------ */
    if (queryParams.gender) {
      matchStage.gender = queryParams.gender;
    }

    if (queryParams.branch) {
      matchStage.branch = queryParams.branch;
    }

    /* ------------------ SALARY RANGE ------------------ */
    if (
      queryParams.basicSalaryRange?.min !== undefined &&
      queryParams.basicSalaryRange?.max !== undefined
    ) {
      matchStage.basicSalary = {
        $gte: queryParams.basicSalaryRange.min,
        $lte: queryParams.basicSalaryRange.max,
      };
    }

    /* ------------------ JOIN DATE RANGE ------------------ */
    if (queryParams.joinDateRange?.from || queryParams.joinDateRange?.to) {
      matchStage.joinDate = {};

      if (queryParams.joinDateRange.from) {
        matchStage.joinDate.$gte = new Date(queryParams.joinDateRange.from);
      }

      if (queryParams.joinDateRange.to) {
        matchStage.joinDate.$lte = new Date(queryParams.joinDateRange.to);
      }
    }

    /* ------------------ SEARCH ------------------ */
    if (queryParams.search) {
      const search = queryParams.search;

      matchStage.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { nid: { $regex: search, $options: "i" } },
        { staffId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
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
    const allowedSortFields = ["createdAt", "updatedAt", "firstName"];
    const sortField = allowedSortFields.includes(queryParams.sortBy)
      ? queryParams.sortBy
      : "createdAt";

    const sortDirection =
      queryParams.sortType?.toLowerCase() === "asc" ? 1 : -1;

    const skip = (queryParams.page - 1) * queryParams.limit;
    const limit = queryParams.limit;

    /* ------------------ AGGREGATION PIPELINE ------------------ */
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "users", // collection name
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

    const result = await Staff.aggregate(pipeline);

    const staffs = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;

    /* ------------------ PAGINATION ------------------ */
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "Staffs fetched successfully!",
        data: staffs,
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
    // Check if staff exists
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: `Staff not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Staff fetched successfully!`,
        data: staff,
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
  body: IUpdateStaff;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = staffUpdateZ.safeParse(body);
  if (!bodyValidation.success) {
    return {
      error: schemaValidationError(
        bodyValidation.error,
        "Invalid request body"
      ),
    };
  }

  try {
    // Check if Staff exists
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: "Staff not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: staff,
        },
      };
    }

    // Update only provided fields
    Object.assign(staff, bodyValidation.data);

    const docs = await staff.save();

    return {
      success: {
        success: true,
        message: "Staff updated successfully",
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
  body: IUpdateStaff;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: userId });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const bodyValidation = staffUpdateZ
    .omit({
      basicSalary: true,
      birthCertificateNumber: true,
      branch: true,
      department: true,
      designation: true,
      joinDate: true,
      nid: true,
      staffId: true,
      userId: true,
      resignationDate: true,
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
    // Check if Staff exists
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: "Staff not fount with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(bodyValidation.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: staff,
        },
      };
    }

    // Update only provided fields
    Object.assign(staff, bodyValidation.data);

    const docs = await staff.save();

    return {
      success: {
        success: true,
        message: "Staff updated successfully",
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
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: `Staff not found with provided ID!`,
        },
      };
    }

    // Delete Staff
    await staff.deleteOne();

    // TODO staff delete korle user delete korbo ki korbo na.
    // Also delete associated user
    // await User.findByIdAndDelete(staff.userId);

    // Response
    return {
      success: {
        success: true,
        message: `Staff deleted successfully!`,
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
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: "Staff not found with provided ID!",
        },
      };
    }

    // Also deactivate user
    await User.findByIdAndUpdate(staff.userId, { isActive: false });

    return {
      success: {
        success: true,
        message: "Staff deactivated successfully!",
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
    const staff = await Staff.findById(idValidation.data._id);

    if (!staff) {
      return {
        error: {
          message: "Staff not found with provided ID!",
        },
      };
    }

    // Also activate user
    await User.findByIdAndUpdate(staff.userId, { isActive: true });

    return {
      success: {
        success: true,
        message: "Staff activated successfully!",
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
