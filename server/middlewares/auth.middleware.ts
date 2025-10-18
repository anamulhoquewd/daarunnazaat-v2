import { verify } from "hono/jwt";
import { getSignedCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { authenticationError, authorizationError } from "../error";
import { Admin } from "../models/admins.model";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

//  Check if admin is authenticated
export const authenticated = async (c: Context, next: Next) => {
  const token =
    c.req.header("Authorization")?.replace("Bearer ", "") ||
    (await getSignedCookie(c, COOKIE_SECRET, "accessToken"));

  if (!token) {
    return authenticationError(c);
  }

  try {
    const decoded = await verify(token, JWT_ACCESS_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded._id) {
      return authenticationError(c);
    }

    const admin = await Admin.findById(decoded._id);

    if (!admin) {
      return authenticationError(c);
    }

    // 🚫 যদি admin block করা থাকে
    if (admin.is_blocked) {
      return authenticationError(
        c,
        "Your account has been blocked. Please contact support."
      );
    }

    c.set("admin", admin);
    return next();
  } catch (error) {
    console.log(error);
    return authenticationError(c);
  }
};

// Check if this admin is admin or not
export const authorized = async (c: Context, next: Next) => {
  const admin = c.get("admin");
  if (!admin) {
    return authenticationError(c);
  }

  if (admin.role === "super_admin") {
    return next();
  }

  return authorizationError(c);
};
