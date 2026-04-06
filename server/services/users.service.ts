import {
  changePasswordZ,
  IUser,
  loginZ,
  mongoIdZ,
  passwordResetZ,
  resetTokenZ,
  UserRole,
  userUpdateZ,
  userZ,
} from "@/validations";
import crypto from "crypto";
import mongoose from "mongoose";
import z from "zod";
import { transporter } from "../config/email";
import { schemaValidationError } from "../error";
import { User } from "../models/users.model";
import { generateAccessToken, generateRefreshToken } from "../utils";
import pagination from "../utils/pagination";
import { stringGenerator } from "../utils/string-generator";

export const register = async (body: IUser) => {
  // Safe Parse for better error handling
  const validData = userZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // You can't register super admin via this route
    if (validData.data.roles.includes("super_admin" as UserRole)) {
      return {
        error: {
          message: "Not allowed to register super admin",
          fields: [
            { name: "roles", message: "Not allowed to register super admin" },
          ],
        },
      };
    }

    // Check if user already exists
    const isUserExist = await User.findOne({
      $or: [{ email: validData.data.email }, { phone: validData.data.phone }],
    });

    if (isUserExist?.isDeleted || isUserExist?.isBlocked) {
      return {
        error: {
          message:
            "Your account was previously deactivated. Please contact admin.",
          fields: [
            {
              name: "email",
              message: "Email must be unique",
            },
            {
              name: "phone",
              message: "Phone number must be unique",
            },
          ],
        },
      };
    }

    if (isUserExist) {
      return {
        error: {
          message: "Sorry! This email/phone already exists.",
          fields: [
            {
              name: "email",
              message: "Email must be unique",
            },
            {
              name: "phone",
              message: "Phone number must be unique",
            },
          ],
        },
      };
    }

    // Generate Password
    const password = stringGenerator(8);

    // Create user
    const user = new User({
      ...validData.data,
      password,
      roles: validData.data.roles,
    });

    // Save user
    const docs = await user.save();

    // Send Email to user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: validData.data.email,
      subject: "Your Account Details",
      text: `Assalamu Alikum,\n\nYour account has been created successfully. Here are your login details:\n\nEmail: ${validData.data.email}\nPassword: ${password}\n\nPlease log in and change your password immediately for security.\n\nJazakallah!`,
    };

    // Send Email
    // await transporter.sendMail(mailOptions);

    return {
      success: {
        success: true,
        message: "User created successfully",
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
  roles: string;
  search: string;
  isActive?: boolean;
  isBlocked?: boolean;
  isDeleted?: boolean;
  createdDateRange: {
    from: string | Date | undefined;
    to: string | Date | undefined;
  };
}) => {
  try {
    const {
      isActive,
      isBlocked,
      search,
      page,
      limit,
      sortBy,
      sortType,
      createdDateRange,
      roles: rolesParam,
      isDeleted,
    } = queryParams;

    // Build query
    const query: any = {};

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }
    if (typeof isBlocked === "boolean") {
      query.isBlocked = isBlocked;
    }
    if (typeof isDeleted === "boolean") {
      query.isDeleted = isDeleted;
    }

    if (rolesParam) {
      const roles = rolesParam.split(",") as UserRole[];
      query.roles = { $in: roles };
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(search),
        });
      }
    }
    // Registration date range
    if (createdDateRange?.from && createdDateRange?.to) {
      query.createdAt = {};
      if (createdDateRange.from)
        query.createdAt.$gte = new Date(createdDateRange.from);
      if (createdDateRange.to)
        query.createdAt.$lte = new Date(createdDateRange.to);
    }

    const allowedSortFields = ["createdAt", "updatedAt", "email"];

    // Allowable sort fields
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortType?.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch users
    const [users, total, totalDocs] = await Promise.all([
      User.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      User.countDocuments(query),
      User.countDocuments(),
    ]);

    // Pagination
    const createPagination = pagination({
      page: page,
      limit: limit,
      total,
      totalDocs,
    });

    return {
      success: {
        success: true,
        message: "Users fetched successfully!",
        data: users,
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
    // Check if admin exists
    let user = await User.findById(idValidation.data._id);

    if (!user) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `User fetched successfully!`,
        data: user,
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

export const updateUser = async ({
  _id,
  body,
}: {
  _id: string;
  body: {
    email: string;
    phone: string;
  };
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = userUpdateZ
    .pick({
      email: true,
      phone: true,
      roles: true,
    })
    .safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid request body"),
    };
  }

  try {
    // Check if user exists
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return {
        error: {
          message: "User not found with the provided ID",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: user,
        },
      };
    }

    // Update only provided fields
    Object.assign(user, validData.data);
    const docs = await user.save();

    return {
      success: {
        success: true,
        message: "User updated successfully",
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

export const updateRoles = async ({
  _id,
  body,
}: {
  _id: string;
  body: { roles: UserRole[] };
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = userZ
    .pick({
      roles: true,
    })
    .safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if user exists
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return {
        error: {
          message: "User not found with the provided ID",
        },
      };
    }

    const existingRoles = user.roles;
    const newRoles = validData.data.roles;

    // prevent removing super_admin
    if (
      existingRoles.includes("super_admin" as UserRole) &&
      !newRoles.includes("super_admin" as UserRole)
    ) {
      return {
        error: {
          message: "Super admin role cannot be removed",
        },
      };
    }

    user.roles = newRoles;

    const docs = await user.save();

    return {
      success: {
        success: true,
        message: "User updated successfully",
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

export const deactivateUser = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return { error: { message: "User not found!" } };
    }

    if (user.roles.includes("super_admin" as UserRole)) {
      return { error: { message: "Super admin cannot be deactivated." } };
    }

    if (!user.isActive) {
      return { error: { message: "User already deactivated." } };
    }

    user.isActive = false;

    await user.save();

    return {
      success: {
        success: true,
        message: "User deactivated successfully",
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

export const activateUser = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check user exists
    const user = await User.findById(_id);

    if (!user) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    if (user.isActive) {
      return { error: { message: "User is already active." } };
    }

    user.isActive = true;

    await user.save();

    return {
      success: {
        success: true,
        message: "User activated successfully",
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

export const blockUser = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return { error: { message: "User not found!" } };
    }

    if (user.roles.includes("super_admin" as UserRole)) {
      return { error: { message: "Super admin cannot be blocked." } };
    }

    if (user.isBlocked) {
      return { error: { message: "User already blocked." } };
    }

    user.isBlocked = true;
    user.blockedAt = new Date();

    await user.save();

    return {
      success: {
        success: true,
        message: "User blocked successfully",
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

export const unblockUser = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check user exists
    const user = await User.findById(_id);

    if (!user) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    if (!user.isBlocked) {
      return { error: { message: "User NOT blocked." } };
    }

    user.isBlocked = false;
    user.blockedAt = null;

    await user.save();

    return {
      success: {
        success: true,
        message: "User NOT BLOCKED successfully",
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

export const deletedUser = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return { error: { message: "User not found!" } };
    }

    if (user.roles.includes("super_admin" as UserRole)) {
      return { error: { message: "Super admin cannot be deleted." } };
    }

    if (user.isDeleted) {
      return { error: { message: "User already deleted." } };
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    return {
      success: {
        success: true,
        message: "User deleted successfully",
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

export const restoreUser = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // optional: check user exists
    const user = await User.findById(_id);

    if (!user) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    if (!user.isDeleted) {
      return { error: { message: "User not deleted." } };
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();

    return {
      success: {
        success: true,
        message: "User RESTORED successfully",
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

export const deleteUser = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    if (user.roles.includes("super_admin" as UserRole)) {
      return {
        error: {
          message: "It is not possible to delete the super admin.",
        },
      };
    }

    // Delete user
    // is deleted flag is on inside of delete
    // await user.deleteOne();
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Response
    return {
      success: {
        success: true,
        message: `User deleted successfully!`,
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

export const changePassword = async ({
  user,
  body,
}: {
  user: any;
  body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}) => {
  // Validate body
  const validData = changePasswordZ.safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  const { currentPassword, newPassword, confirmPassword } = validData.data;

  if (newPassword !== confirmPassword) {
    return {
      error: {
        message: "New password and confirm password do not match",
        fields: [
          {
            name: "confirmPassword",
            message: "Passwords must match",
          },
        ],
      },
    };
  }

  try {
    // Validate current password
    if (!(await user.matchPassword(currentPassword))) {
      return {
        error: {
          message: "Current password is incorrect",
          fields: [
            {
              name: "currentPassword",
              message: "Current password is incorrect",
            },
          ],
        },
      };
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return {
      success: {
        success: true,
        message: "Password changed successfully",
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

export const forgotPassword = async (email: string) => {
  // Validate email
  const validateSchema = z.object({
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address." }),
  });

  const validData = validateSchema.safeParse({ email });
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const user = await User.findOne({ email: validData.data.email });

    if (!user) {
      return {
        error: {
          message: "User not found with this email",
          fields: [
            {
              name: "email",
              message: "User not found with this email",
            },
          ],
        },
      };
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken(15);

    // Save the reset token and expire time
    await user.save();

    // Generate URL
    const resetUrl = `${process.env.DOMAIN}/auth/reset-password/${resetToken}`;

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Account Details",
      text: `Assalamu alikum,\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email. This token will expire in 30 minutes.\n\nJazakallah!`,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: {
        success: true,
        message: "Password reset link sent successfully.",
        token: resetToken,
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

export const resetPassword = async ({
  password,
  resetToken,
}: {
  password: string;
  resetToken: string;
}) => {
  const validData = passwordResetZ.safeParse({ password });
  const tokenValidation = resetTokenZ.safeParse({ resetToken });

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  if (!tokenValidation.success) {
    return {
      error: {
        message: "Token Validation error",
        fields: tokenValidation.error.issues.map((issue) => ({
          name: String(issue.path[0]),
          message: issue.message,
        })),
      },
    };
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  try {
    const data = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!data) {
      return {
        error: {
          message: "Invalid or expired reset token",
          fields: [
            {
              name: "resetToken",
              message: "Invalid or expired reset token",
            },
          ],
        },
      };
    }

    data.password = password;
    data.passwordResetToken = null;
    data.passwordResetExpires = null;

    await data.save();

    return {
      success: {
        success: true,
        message: "Password reset successfully",
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

export const login = async (body: {
  email: string;
  phone: string;
  password: string;
}) => {
  // Safe Parse for better error handling
  const validData = loginZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  // Destructure Body
  const { email, phone, password } = validData.data;

  try {
    // Check if user exists
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    }).select("password email roles isActive isBlocked refreshTokens");

    if (!user) {
      return {
        error: {
          message: "Invalid credentials",
          fields: [
            {
              name: "email",
              message: "User not found with this email or phone",
            },
          ],
        },
      };
    }

    // Check if user is blockd
    if (user.isBlocked) {
      throw new Error("Account is BLOCKED. Please contact admin.");
    }

    // Validate password
    if (!(await user.matchPassword(password))) {
      return {
        error: {
          message: "Invalid credentials",
          fields: [
            {
              name: "password",
              message: "Password is incorrect",
            },
          ],
        },
      };
    }

    // Generate access token
    const accessToken = await generateAccessToken({ user });

    // Generate refresh token
    const refreshToken = await generateRefreshToken({ user });

    // Refresh tokens store in database
    if (!user.refreshTokens.includes(refreshToken)) {
      user.refreshTokens.push(refreshToken);
    }

    // Remove old refresh tokens
    if (user.refreshTokens.length > 2) {
      user.refreshTokens = user.refreshTokens.slice(-2); // last 2 tokens
    }

    // last login update
    user.lastLogin = new Date();

    await user.save();

    // Response
    return {
      success: {
        success: true,
        message: "Login successfully!",
        tokens: {
          accessToken,
          refreshToken,
        },
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

// Permanent delete (hard delete) - use with caution
export const permanentDelete = async (_id: string) => {
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const user = await User.findById(idValidation.data._id);

    if (!user) {
      return { error: { message: "User not found!" } };
    }

    if (user.roles.includes("super_admin" as UserRole)) {
      return { error: { message: "Super admin cannot be deleted." } };
    }

    await user.deleteOne();

    return {
      success: {
        success: true,
        message: "User deleted successfully",
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
