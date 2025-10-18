import { sign } from "hono/jwt";
import { setSignedCookie } from "hono/cookie";
import type { IAdmin } from "../interfaces";
import type { Context } from "hono";
import { accessTokenExpMinutes, refreshTokenExpDays } from "../config/default";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

const DOMAIN_NAME = process.env.DOMAIN_NAME as string;

// Generate Access Token
export const generateAccessToken = async ({
  user,
  expMinutes = accessTokenExpMinutes,
}: {
  user: IAdmin;
  expMinutes?: number;
}) => {
  const token = await sign(
    {
      _id: user._id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * expMinutes,
      // exp: Math.floor(Date.now() / 1000) + 60, // 1m
    },
    JWT_ACCESS_SECRET
  );

  if (!token) {
    throw new Error("Token generation failed");
  }

  return token;
};

// Generate Refresh Token
export const generateRefreshToken = async ({
  user,
  expDays = refreshTokenExpDays,
}: {
  user: IAdmin;
  expDays?: number;
}) => {
  const token = await sign(
    {
      _id: user._id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * expDays,
      // exp: Math.floor(Date.now() / 1000) + 60 * 2, // 2m
    },
    JWT_REFRESH_SECRET as string
  );

  if (!token) {
    throw new Error("Token generated failed");
  }
  return token;
};

export const setAuthCookie = async (
  c: Context,
  name: string,
  value: string,
  maxAgeSeconds: number
) => {
  console.log("Called setAuthCookie function");
  return await setSignedCookie(c, name, value, COOKIE_SECRET as string, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: maxAgeSeconds,
    expires: new Date(Date.now() + maxAgeSeconds * 1000),
    domain: process.env.NODE_ENV === "production" ? DOMAIN_NAME : undefined,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
};
