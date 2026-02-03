import { IUser } from "@/validations";
import { sign } from "hono/jwt";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;

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
    JWT_ACCESS_SECRET,
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
    JWT_REFRESH_SECRET as string,
  );

  if (!token) {
    throw new Error("Token generated failed");
  }
  return token;
};

export function calculatePayable({
  baseFee,
  previousDue,
  previousAdvance,
}: {
  baseFee: number;
  previousDue: number;
  previousAdvance: number;
}) {
  let payable = baseFee + previousDue - previousAdvance;

  if (payable < 0) {
    return {
      payableAmount: 0,
      usedAdvance: baseFee + previousDue,
      remainingAdvance: Math.abs(payable),
    };
  }

  return {
    payableAmount: payable,
    usedAdvance: previousAdvance,
    remainingAdvance: 0,
  };
}
