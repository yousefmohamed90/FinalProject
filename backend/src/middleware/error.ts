import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err && typeof err === "object") {
    const e = err as { name?: string; code?: number; message?: string; errors?: Record<string, { message: string }> };
    if (e.name === "CastError") {
      statusCode = 404;
      message = "Resource not found";
    } else if (e.code === 11000) {
      statusCode = 400;
      message = "Duplicate field value entered";
    } else if (e.name === "ValidationError" && e.errors) {
      statusCode = 400;
      message = Object.values(e.errors).map((v) => v.message).join(", ");
    } else if (e.message) {
      message = e.message;
    }
  }

  console.error(`[${statusCode}] ${message}`);
  res.status(statusCode).json({ success: false, error: message });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(`Not Found - ${req.originalUrl}`, 404));
};
