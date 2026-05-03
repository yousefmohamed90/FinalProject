import type { Request, Response } from "express";
import crypto from "node:crypto";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendTokenResponse } from "../utils/sendTokenResponse.js";

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    throw new ApiError("Please provide name, email, and password", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError("Email is already registered", 400);

  const user = await User.create({ name, email: email.toLowerCase(), password });

  // Generate email verification token and send link
  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const baseUrl =
    process.env["CLIENT_URL"] ||
    `${req.protocol}://${req.get("host")}`;
  const verifyUrl = `${baseUrl}/verify-email/${verifyToken}`;

  await sendEmail({
    email: user.email,
    subject: "Verify your CodeSource account",
    html: `
      <h2>Welcome to CodeSource, ${user.name}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  }).catch(() => {
    /* swallow email errors so registration still succeeds in dev */
  });

  sendTokenResponse(user, 201, res);
});

/**
 * @desc    Login user with email + password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new ApiError("Please provide an email and password", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user) throw new ApiError("Invalid credentials", 401);

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new ApiError("Invalid credentials", 401);

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Log user out / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res
    .cookie("token", "", {
      expires: new Date(Date.now() + 1000),
      httpOnly: true,
      path: "/",
    })
    .json({ success: true });
});

/**
 * @desc    Verify a user's email via token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params as { token?: string };
  if (!token) throw new ApiError("Token required", 400);

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpire: { $gt: new Date() },
  });
  if (!user) throw new ApiError("Invalid or expired token", 400);

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "Email verified" });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  const user = await User.findById(req.user._id).populate("purchasedItems");
  res.json({ success: true, user });
});

/**
 * @desc    Delete current user account
 * @route   DELETE /api/v1/auth/me
 * @access  Private
 */
export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  await User.findByIdAndDelete(req.user._id);
  res.cookie("token", "", { expires: new Date(Date.now() + 1000), httpOnly: true, path: "/" });
  res.json({ success: true, message: "Account deleted" });
});

/**
 * @desc    Forgot password — emails reset link
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email) throw new ApiError("Email required", 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak existence of email
      res.json({ success: true });
      return;
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const baseUrl =
      process.env["CLIENT_URL"] ||
      `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset",
        html: `
          <h2>Password reset request</h2>
          <p>Click the link below to reset your password (valid for 10 minutes):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        `,
      });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.json({ success: true });
  },
);

/**
 * @desc    Reset password using token
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params as { token?: string };
    const { password } = req.body as { password?: string };
    if (!token || !password) throw new ApiError("Token and password required", 400);

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() },
    });
    if (!user) throw new ApiError("Invalid or expired token", 400);

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  },
);
