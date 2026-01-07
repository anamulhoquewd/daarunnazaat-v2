import { sign } from "hono/jwt";
import { setSignedCookie } from "hono/cookie";
import type { Context } from "hono";
import { IUser } from "@/validations";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

const DOMAIN_NAME = process.env.DOMAIN_NAME as string;

// Generate Access Token
export const generateAccessToken = async ({
  user,
  expMinutes = 15,
}: {
  user: IUser;
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
  expDays = 7,
}: {
  user: IUser;
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
