import type { Request, Response } from "express";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    List all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users, data: users });
});

/**
 * @desc    Get a single user
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = await User.findById(id).select(
    "name email avatar role isVerified createdAt",
  );
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, user });
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (own profile or admin)
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);

  const { id } = req.params as { id: string };
  const { name, email, avatar, role, isVerified } = req.body as {
    name?: string;
    email?: string;
    avatar?: string;
    role?: "user" | "admin";
    isVerified?: boolean;
  };

  const isOwner = req.user._id.toString() === id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError("You are not authorized to update this user", 403);
  }

  const updates: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: "user" | "admin";
    isVerified?: boolean;
  } = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (avatar !== undefined) updates.avatar = avatar;

  if (isAdmin) {
    if (role !== undefined) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;
  }

  const user = await User.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true },
  );
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true, user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError("User not found", 404);
  res.json({ success: true });
});
