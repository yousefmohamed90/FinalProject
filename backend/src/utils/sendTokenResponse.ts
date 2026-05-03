import type { Response } from "express";
import type { IUser } from "../models/User.js";

/**
 * Sign a JWT for the user, set it as an HttpOnly cookie, and respond
 * with the user's public profile.
 */
export function sendTokenResponse(
  user: IUser,
  statusCode: number,
  res: Response,
): void {
  const token = user.getSignedJwtToken();

  const days = parseExpireDays(process.env["JWT_EXPIRE"] || "30d");
  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        purchasedItems: user.purchasedItems,
      },
    });
}

function parseExpireDays(expr: string): number {
  const match = /^(\d+)([dhm])$/.exec(expr);
  if (!match) return 30;
  const value = Number(match[1]);
  switch (match[2]) {
    case "d":
      return value;
    case "h":
      return value / 24;
    case "m":
      return value / (24 * 60);
    default:
      return 30;
  }
}
