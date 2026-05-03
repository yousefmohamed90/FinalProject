import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { type IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

/**
 * Verifies a JWT from the HttpOnly cookie or `Authorization: Bearer` header
 * and attaches the matching user to `req.user`.
 */
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const auth = req.headers.authorization;
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    } else if (req.cookies && (req.cookies as Record<string, string>)["token"]) {
      token = (req.cookies as Record<string, string>)["token"];
    }

    if (!token) {
      throw new ApiError("Not authorized to access this route", 401);
    }

    const secret = process.env["JWT_SECRET"];
    if (!secret) throw new ApiError("Server misconfiguration", 500);

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new ApiError("Not authorized: invalid token", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError("Not authorized: user not found", 401);

    req.user = user;
    next();
  },
);

/**
 * Restricts route access to one or more roles.
 * Usage: `router.delete('/x', protect, authorizeRoles('admin'))`
 */
export const authorizeRoles =
  (...roles: Array<"user" | "admin">) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new ApiError(
          `Role '${req.user?.role ?? "guest"}' is not authorized for this route`,
          403,
        ),
      );
      return;
    }
    next();
  };
