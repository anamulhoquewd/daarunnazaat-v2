import { changePasswordZ, IUser, loginZ, mongoIdZ, userZ } from "@/validations";
import { transporter } from "../config/email";
import { schemaValidationError } from "../error";
import { User } from "../models/users.model";
import { stringGenerator } from "../utils/string-generator";
import z from "zod";
import { generateAccessToken, generateRefreshToken } from "../utils";
import mongoose from "mongoose";
import pagination from "../utils/pagination";

export const register = async (body: IUser) => {
  // Safe Parse for better error handling
  const validData = userZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if user already exists
    const isUserExist = await User.findOne({
      $or: [{ email: validData.data.email }, { phone: validData.data.phone }],
    }).select("-password");

    if (isUserExist) {
      return {
        error: {
          message: "Sorry! This email already exists.",
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
      role: validData.data.role,
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

export const registerSuperAdmin = async () => {
  // Safe Parse for better error handling
  const validData = userZ.omit({ role: true }).safeParse({
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE,
  });

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }
  try {
    // Check if super admin already exists
    const isSuperAdminExist = await User.findOne({ role: "super_admin" });

    if (isSuperAdminExist) {
      return {
        success: false,
        error: {
          message: "Super admin already exists",
        },
      };
    }

    // Create Super user
    const user = new User({
      email: validData.data.email,
      phone: validData.data.phone,
      password: process.env.ADMIN_PASSWORD as string,
      role: "super_admin",
    });

    // Save Super user
    const docs = await user.save();

    // Response
    return {
      message: "Super admin created successfully!",
      success: true,
      data: docs,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
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
      query.$or = [
        { name: { $regex: queryParams.search, $options: "i" } },
        { email: { $regex: queryParams.search, $options: "i" } },
        { phone: { $regex: queryParams.search, $options: "i" } },
        { NID: { $regex: queryParams.search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "name", "email"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch users
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      User.countDocuments(query),
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

// FIXME
export const get = async (
  _id: string,
  { userType }: { userType: "user" | "admin" }
) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    // Check if admin exists
    let data;

    if (userType === "admin") {
      data = await User.findById(idValidation.data._id);
    } else if (userType === "user") {
      data = await User.findById(idValidation.data._id);
    }

    if (!data) {
      return {
        error: {
          message: `${userType} not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `${userType} fetched successfully!`,
        data: data,
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

export const updateProfile = async ({
  user,
  body,
}: {
  user: any;
  body: TUpdateAdmin;
}) => {
  // Validation without NID for update
  const validData = userZ.omit({ nid: true, role: true }).safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Merge only allowed fields into user
    Object.assign(user, validData.data);

    const docs = await user.save();

    return {
      success: {
        success: true,
        message: "User profile updated successfully!",
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

export const deleteUser = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return {
      error: schemaValidationError(idValidation.error, "Invalid ID"),
    };
  }

  try {
    const data = await User.findById(idValidation.data._id);

    if (!data) {
      return {
        error: {
          message: `User not found with provided ID!`,
        },
      };
    }

    if (data.role === "super_admin") {
      return {
        error: {
          message: "It is not possible to delete the super admin.",
        },
      };
    }

    // Delete user
    await data.deleteOne();

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
    email: z.string().email({ message: "Please enter a valid email address." }),
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
  const bodySchema = z.object({
    password: z.string().min(8).max(20),
  });
  const tokenSchema = z.object({
    resetToken: z.string().length(64, "Invalid reset token format"),
  });

  const validData = bodySchema.safeParse({ password });
  const tokenValidation = tokenSchema.safeParse({ resetToken });

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  if (!tokenValidation.success) {
    return {
      error: {
        msg: "Token Validation error",
        fields: tokenValidation.error.issues.map((issue) => ({
          name: String(issue.path[0]),
          message: issue.message,
        })),
      },
    };
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpireDate: { $gt: Date.now() },
    });

    if (!user) {
      return {
        error: {
          message: "Invalid or expired reset token",
        },
      };
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpireDate = null;

    await user.save();

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
    }).select("password email role isActive isBlocked refreshTokens");

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

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact admin.");
    }

    // Check if user is blockd
    if (user.isBlocked) {
      throw new Error("Account is blocked. Please contact admin.");
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
