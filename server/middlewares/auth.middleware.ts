import { decode, verify } from "hono/jwt";
import { deleteCookie, getSignedCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { authenticationError, authorizationError } from "../error";
import { User } from "../models/users.model";
import { IUser, UserRole } from "@/validations";
import { Student } from "../models/students.model";
import { Guardian } from "../models/guardians.model";
import { Staff } from "../models/staffs.model";

//  Check if user is authenticate
export const authenticate = async (c: Context, next: Next) => {
  try {
    const token = await getSignedCookie(
      c,
      process.env.JWT_ACCESS_SECRET as string,
      "accessToken"
    );

    if (!token) {
      return authenticationError(c);
    }

    const payload = await verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );

    if (!payload || typeof payload !== "object" || !payload._id) {
      return authenticationError(c);
    }

    const user = await User.findById(payload._id);

    if (!user) {
      // Clear cookie using Hono's deleteCookie
      deleteCookie(c, "accessToken", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? (process.env.DOMAIN_NAME as string)
            : undefined,
      });
      deleteCookie(c, "refreshToken", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? (process.env.DOMAIN_NAME as string)
            : undefined,
      });

      return authenticationError(c);
    }

    // 🚫 if user blocked
    if (user.isBlocked) {
      return authenticationError(
        c,
        "Your account has been blocked. Please contact support."
      );
    }

    c.set("user", user);

    return next();
  } catch (error) {
    console.log(error);
    return authenticationError(c);
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return authenticationError(c);
    }

    if (!allowedRoles.includes(user.role)) {
      return authorizationError(c);
    }

    await next();
  };
};

// Check if user owns the resource
export const checkOwnership = (
  resourceType: "student" | "guardian" | "staff"
) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    const resourceId = c.req.param("id");

    // Super admin and admin can access everything
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return await next();
    }

    // Check ownership based on resource type
    let resource;
    switch (resourceType) {
      case "student":
        resource = await Student.findById(resourceId);
        break;
      case "guardian":
        resource = await Guardian.findById(resourceId);
        break;
      case "staff":
        resource = await Staff.findById(resourceId);
        break;
    }

    if (!resource || resource.userId.toString() !== user.userId) {
      return authorizationError(c);
    }

    await next();
  };
};
