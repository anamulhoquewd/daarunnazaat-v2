import { UserRole } from "@/validations";
import axios from "axios";
import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { decode, verify } from "hono/jwt";
import {
  authenticationError,
  authorizationError,
  badRequestError,
  serverError,
} from "../error";
import { User } from "../models/users.model";
import { userServices } from "../services";
import { generateAccessToken } from "../utils";

export const register = async (c: Context) => {
  const body = await c.req.json();

  const response = await userServices.register(body);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 201);
};

// Get all users
export const getUsers = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") as string;
  const sortType = c.req.query("sortType") as string;
  const search = c.req.query("search") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;
  const isActiveRaw = c.req.query("isActive") as string;
  const isBlockedRaw = c.req.query("isBlocked") as string;
  const role = c.req.query("role") as UserRole;

  const createdDateRange = { from: fromDate, to: toDate };

  let isActive: boolean | undefined = undefined;
  let isBlocked: boolean | undefined = undefined;

  if (isBlockedRaw === "true") isBlocked = true;
  if (isBlockedRaw === "false") isBlocked = false;

  if (isActiveRaw === "true") isActive = true;
  if (isActiveRaw === "false") isActive = false;

  const response = await userServices.gets({
    page,
    limit,
    sortBy,
    sortType,
    role,
    search,
    createdDateRange,
    isActive,
    isBlocked,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// get user
export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await userServices.get(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Get Me
export const getMe = async (c: Context) => {
  try {
    // Get user from auth token
    const me = await c.get("user");

    // Check if user is authenticated
    if (!me) {
      return authenticationError(c);
    }

    // Check if avatar is exist
    const avatarUrl = me?.avatar?.url;

    if (avatarUrl) {
      try {
        // Check if signed URL is valid
        await axios.get(avatarUrl, {
          headers: { Range: "bytes=0-0" },
        });
      } catch (error: any) {
        throw error;
      }
    }

    // Response
    return c.json(
      {
        success: true,
        message: "User fetched successfully",
        data: me,
      },
      200,
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
      500,
    );
  }
};

// Update user
export const updateUser = async (c: Context) => {
  const body = await c.req.json();
  const _id = c.req.param("_id");

  const response = await userServices.updateUser({ body, _id });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Delete user
export const deleteUser = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await userServices.deleteUser(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// signIn admin
export const signIn = async (c: Context) => {
  const body = await c.req.json();

  const response = await userServices.login(body);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  //  tokens setting on the cookie
  if (response.success.success) {
    await setSignedCookie(
      c,
      "accessToken",
      response.success.tokens.accessToken,
      process.env.JWT_ACCESS_SECRET as string,
      {
        httpOnly: true,
        path: "/",
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN_NAME
            : undefined,
        maxAge: 60 * 15,
      },
    );

    await setSignedCookie(
      c,
      "refreshToken",
      response.success.tokens.refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN_NAME
            : undefined,
        maxAge: 7 * 24 * 60 * 60, // 7d
      },
    );
  }

  return c.json(response.success, 200);
};

// signOut admin
export const signOut = async (c: Context) => {
  try {
    // 1. Read refresh token from cookie
    const rToken = await getSignedCookie(
      c,
      process.env.JWT_REFRESH_SECRET as string,
      "refreshToken",
    );

    if (!rToken) {
      return authenticationError(c, "Refresh token missing");
    }

    // 2. Decode token (don't need verify logout face)
    const decoded = decode(rToken as unknown as string) as any;

    if (!decoded?.payload) {
      return authenticationError(c, "Invalid refresh token");
    }

    const _id = decoded.payload._id;

    // 3. Remove refresh token from DB (array হলে)
    await User.updateOne({ _id: _id }, { $pull: { refreshTokens: rToken } });

    // 4. Clear cookies
    deleteCookie(c, "accessToken", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.DOMAIN_NAME
          : undefined,
    });

    deleteCookie(c, "refreshToken", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.DOMAIN_NAME
          : undefined,
    });

    // Response
    return c.json(
      {
        success: true,
        message: "signOut successful",
      },
      200,
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
      500,
    );
  }
};

// Refresh Token
export const refreshToken = async (c: Context) => {
  try {
    // Get refresh token from cookie
    const rToken = await getSignedCookie(
      c,
      process.env.JWT_REFRESH_SECRET as string,
      "refreshToken",
    );

    if (!rToken) {
      return authenticationError(c);
    }

    // Verify refresh payload
    const payload = await verify(
      rToken,
      process.env.JWT_REFRESH_SECRET as string,
    );

    if (!payload) {
      return authenticationError(c);
    }

    // Check if refresh token is valid
    const user = await User.findOne({
      refreshTokens: rToken,
      _id: payload._id,
    });

    if (!user) {
      return authenticationError(c);
    }

    // Generate new access token
    const accessToken = await generateAccessToken({ user });

    if (!accessToken) {
      return serverError(c, {
        message: "Access token generation failed",
      });
    }

    await setSignedCookie(
      c,
      "accessToken",
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
      {
        httpOnly: true,
        path: "/",
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN_NAME
            : undefined,
        maxAge: 60 * 15,
      },
    );

    // Response
    return c.json(
      {
        success: true,
        message: "Token refreshed",
        tokens: {
          accessToken,
        },
      },
      200,
    );
  } catch (error: any) {
    console.log("Error during token refresh:", error);
    if (error.name === "JwtTokenExpired") {
      return authorizationError(
        c,
        "Refresh token expired. Please login again.",
      );
    }

    return c.json(
      {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
      500,
    );
  }
};

// block
export const blockUser = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await userServices.blockUser(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// unblock
export const unblockUser = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await userServices.unblockUser(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Change Password
export const changePassword = async (c: Context) => {
  const body = await c.req.json();

  // Check if user exists. and get email from token
  const { email } = await c.get("user");

  const user = await User.findOne({ email }).select("password");

  if (!user) {
    return authenticationError(c);
  }

  const response = await userServices.changePassword({
    user,
    body,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Forgot Password
export const forgotPassword = async (c: Context) => {
  const { email } = await c.req.json();

  const response = await userServices.forgotPassword(email);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 201);
};

// Reset Password
export const resetPassword = async (c: Context) => {
  // Token come from param
  const resetToken = c.req.param("resetToken");

  // Password come from body
  const { password } = await c.req.json();

  const response = await userServices.resetPassword({
    password,
    resetToken,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
