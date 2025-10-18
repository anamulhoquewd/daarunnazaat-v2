import {
  adminCreateZ,
  adminUpdateZ,
  changePasswordZ,
  forgotPasswordZ,
  idSchemaZ,
  loginSchemeZ,
  type TAdminCreate,
  type TAdminUpdate,
} from "./../validations/zod";
import z from "zod";
import { schemaValidationError } from "../error";
import { Admin } from "../models/admins.model";
import { stringGenerator } from "../utils/string-generator";
import pagination from "../utils/pagination";
import { transporter } from "../config/email";
import { generateAccessToken, generateRefreshToken } from "../utils";

// Get environment variables
const NAME = process.env.ADMIN_NAME as string | "Anamul Hoque";
const EMAIL = process.env.ADMIN_EMAIL as string | "anamulhoquewd@gmail.com";
const PHONE = process.env.ADMIN_PHONE as string | "01975024262";
const PASSWORD = process.env.ADMIN_PASSWORD as string | "password";

const EMAIL_USER = process.env.EMAIL_USER;

export const register = async (body: TAdminCreate) => {
  // Safe Parse for better error handling
  const validData = adminCreateZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if admin already exists
    const isExistAdmin = await Admin.findOne({
      $or: [{ email: validData.data.email }, { phone: validData.data.phone }],
    });

    if (isExistAdmin) {
      return {
        error: {
          message: "Sorry! This admin already exists.",
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

    // Create Admin
    const admin = new Admin({
      ...validData.data,
      password,
      role: "admin",
    });

    // Save Admin
    const docs = await admin.save();

    // Send Email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: validData.data.email,
      subject: "Your Account Details",
      text: `Hello ${validData.data.name},\n\nYour account has been created successfully. Here are your login details:\n\nEmail: ${validData.data.email}\nPassword: ${password}\n\nPlease log in and change your password immediately for security.\n\nThank you!`,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    return {
      success: {
        success: true,
        message: "Admin created successfully",
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
  const validData = adminCreateZ.omit({ role: true }).safeParse({
    name: NAME,
    email: EMAIL,
    phone: PHONE,
  });

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }
  try {
    // Check if super admin already exists
    const isExistSuperAdmin = await Admin.findOne({ role: "super_admin" });

    if (isExistSuperAdmin) {
      return {
        success: false,
        error: {
          message: "Super Admin already exists",
        },
      };
    }

    // Create Super Admin
    const admin = new Admin({
      name: validData.data.name,
      email: validData.data.email,
      phone: validData.data.phone,
      password: PASSWORD,
      role: "super_admin",
    });

    // Save Super Admin
    const docs = await admin.save();

    // Response
    return {
      message: "Super Admin created successfully!",
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
      ];
    }
    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "name", "email"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "name";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch admins
    const [admins, total] = await Promise.all([
      Admin.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Admin.countDocuments(),
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
        message: "Admins fetched successfully!",
        data: admins,
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
    // Check if admin exists
    const admin = await Admin.findById(idValidation.data._id);

    if (!admin) {
      return {
        error: {
          message: `Admin not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Admin fetched successfully!`,
        data: admin,
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
    phone: string;
    email: string;
    address: string;
    designation: string; // পদবী
    join_date: Date;
    is_active: boolean;
    is_blocked: boolean;
  };
}) => {
  // Validate ID
  const idValidation = idSchemaZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = adminUpdateZ.omit({ role: true }).safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if admin exists
    const admin = await Admin.findById(idValidation.data._id).select(
      "-password"
    );

    if (!admin) {
      return {
        error: {
          message: "Admin not fount with the provided ID",
        },
      };
    }

    if (
      admin.role === "super_admin" &&
      (validData.data?.is_blocked || !validData.data?.is_active)
    ) {
      return {
        error: {
          message: "It is not possible to block or diactive the super admin.",
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: admin,
        },
      };
    }

    // Update only provided fields
    Object.assign(admin, validData.data);
    const docs = await admin.save();

    return {
      success: {
        success: true,
        message: "Admin updated successfully",
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

export const updateProfile = async ({
  admin,
  body,
}: {
  admin: any;
  body: TAdminUpdate;
}) => {
  // Validation without NID for update
  const validData = adminUpdateZ
    .omit({
      email: true,
      role: true,
      designation: true,
      is_active: true,
      is_blocked: true,
    })
    .safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing admin",
          data: admin,
        },
      };
    }
    // Merge only allowed fields into admin
    Object.assign(admin, validData.data);

    const docs = await admin.save();

    return {
      success: {
        success: true,
        message: "Admin profile updated successfully!",
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
    const data = await Admin.findById(idValidation.data._id);

    if (!data) {
      return {
        error: {
          message: `Admin not found with provided ID!`,
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

    // Delete admin
    await data.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `Admin deleted successfully!`,
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
  admin,
  body,
}: {
  admin: any;
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
    if (!(await admin.matchPassword(currentPassword))) {
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
    admin.password = newPassword;
    await admin.save();

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
  const validData = forgotPasswordZ.safeParse({ email });
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const data = await Admin.findOne({ email: validData.data.email });

    if (!data) {
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
    const resetToken = data.generateResetPasswordToken();

    // Save the reset token and expire time
    await data.save();

    // Generate URL
    const resetUrl = `https://daarunnazaat.vercel.app/auth/reset-password/${resetToken}`;

    // Send Email
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Your Account Details",
      text: `Hello ${data.name},\n\nClick the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email. This token will expire in 30 minutes.\n\nBest regards,\n${data.name}`,
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
    const data = await Admin.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpireDate: { $gt: Date.now() },
    });

    if (!data) {
      return {
        error: {
          message: "Invalid or expired reset token",
        },
      };
    }

    data.password = password;
    data.resetPasswordToken = null;
    data.resetPasswordExpireDate = null;

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
  const validData = loginSchemeZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  // Destructure Body
  const { email, phone, password } = validData.data;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({
      $or: [{ email }, { phone }],
    }).select("password email role");

    if (!admin) {
      return {
        error: {
          message: "Invalid credentials",
          fields: [
            {
              name: "email",
              message: "Admin not found with this email or phone",
            },
          ],
        },
      };
    }

    // 🚫 Check if blocked
    if (admin.is_blocked) {
      return {
        error: {
          message: "Your account is blocked. Please contact support.",
          fields: [
            {
              name: "email",
              message: "This account is currently blocked.",
            },
          ],
        },
      };
    }

    // Validate password
    if (!(await admin.matchPassword(password))) {
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
    const accessToken = await generateAccessToken({ user: admin });

    // Generate refresh token
    const refreshToken = await generateRefreshToken({ user: admin });

    // Refresh token store in database
    admin.refresh = refreshToken;
    await admin.save();

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
