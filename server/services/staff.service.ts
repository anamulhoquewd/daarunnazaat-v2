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
import mongoose from "mongoose";
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

  gender: Gender;
  bloodGroup: BloodGroup;
  joinDateRange: {
    from: string | Date | undefined;
    to: string | Date | undefined;
  };
  basicSalaryRange: {
    min: number;
    max: number;
  };
  branch: Branch;
  search: string;
}) => {
  try {
    // Build query
    const query: any = {};
    if (queryParams.gender) query.gender = queryParams.gender;
    if (queryParams.bloodGroup) query.bloodGroup = queryParams.bloodGroup;
    if (queryParams.branch) query.branch = queryParams.branch;

    if (queryParams.search) {
      query.$or = [
        { firstName: { $regex: queryParams.search, $options: "i" } },
        { lastName: { $regex: queryParams.search, $options: "i" } },
        { nid: { $regex: queryParams.search, $options: "i" } },
        { staffId: { $regex: queryParams.search, $options: "i" } },
        { designation: { $regex: queryParams.search, $options: "i" } },
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

    if (
      queryParams.basicSalaryRange &&
      queryParams.basicSalaryRange.min &&
      queryParams.basicSalaryRange.max
    ) {
      query.basicSalary = {
        $gte: queryParams.basicSalaryRange.min,
        $lte: queryParams.basicSalaryRange.max,
      };
    }

    if (
      queryParams.joinDateRange &&
      queryParams.joinDateRange.from &&
      queryParams.joinDateRange.to
    ) {
      // Length should be 2
      query.joinDate = {};
      if (queryParams.joinDateRange.from)
        query.joinDate.$gte = new Date(queryParams.joinDateRange.from);
      if (queryParams.joinDateRange.to)
        query.joinDate.$lte = new Date(queryParams.joinDateRange.to);
      if (Object.keys(query.joinDate).length === 0) delete query.joinDate;
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "firstName"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch staff
    const [staffs, total] = await Promise.all([
      Staff.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Staff.countDocuments(query),
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
