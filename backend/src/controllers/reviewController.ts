import type { Request, Response } from "express";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create a review for a product (must be a purchaser)
 * @route   POST /api/v1/products/:id/reviews
 * @access  Private
 */
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { id } = req.params as { id: string };
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string;
    };

    if (!rating || !comment) {
      throw new ApiError("Rating and comment are required", 400);
    }

    const product = await Product.findById(id);
    if (!product) throw new ApiError("Product not found", 404);

    const owns = req.user.purchasedItems.some(
      (p) => p.toString() === id,
    );
    if (!owns && req.user.role !== "admin") {
      throw new ApiError("Only purchasers can review this product", 403);
    }

    try {
      const review = await Review.create({
        rating,
        comment,
        product: id,
        user: req.user._id,
      });
      res.status(201).json({ success: true, review });
    } catch (err: unknown) {
      const e = err as { code?: number };
      if (e.code === 11000) {
        throw new ApiError("You already reviewed this product", 400);
      }
      throw err;
    }
  },
);

/**
 * @desc    Delete own review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);
    const { id } = req.params as { id: string };

    const review = await Review.findById(id);
    if (!review) throw new ApiError("Review not found", 404);

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiError("Not authorized", 403);
    }

    await Review.findByIdAndDelete(id);
    res.json({ success: true });
  },
);

/**
 * @desc    Update own review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
export const updateReview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);
    const { id } = req.params as { id: string };
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string;
    };

    const review = await Review.findById(id);
    if (!review) throw new ApiError("Review not found", 404);

    if (review.user.toString() !== req.user._id.toString()) {
      throw new ApiError("Not authorized to update this review", 403);
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    res.json({ success: true, review });
  },
);
