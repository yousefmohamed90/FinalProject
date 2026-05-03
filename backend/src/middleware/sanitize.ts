import type { NextFunction, Request, Response } from "express";
import sanitize from "mongo-sanitize";

/**
 * Recursively strips MongoDB operator characters ($, .) from request body
 * keys to prevent NoSQL injection.
 *
 * Note: Express 5 makes `req.query` read-only, so we only sanitize body
 * here. Query parameters are validated explicitly per-route.
 */
export const mongoSanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body) {
    req.body = sanitize(req.body) as unknown;
  }
  next();
};
