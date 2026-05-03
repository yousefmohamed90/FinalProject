import type { Request, Response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create a checkout — records order and marks as paid immediately
 * @route   POST /api/v1/orders/checkout
 * @access  Private
 *
 * Body: { items: [{ productId: string, qty: number }] }
 */
export const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { items } = req.body as {
      items?: Array<{ productId: string; qty: number }>;
    };
    if (!items || items.length === 0) {
      throw new ApiError("Cart is empty", 400);
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      throw new ApiError("Some products no longer exist", 400);
    }

    const baseUrl =
      process.env["CLIENT_URL"] ||
      `${req.protocol}://${req.get("host")}`;

    const sessionId = `order_${Date.now()}`;

    await Order.create({
      user: req.user._id,
      orderItems: products.map((p) => ({
        name: p.title,
        qty: items.find((i) => i.productId === p._id.toString())?.qty || 1,
        price: p.price,
        product: p._id,
      })),
      sessionId,
      paymentStatus: "paid",
      totalAmount:
        Math.round(
          products.reduce((sum, p) => {
            const qty = items.find((i) => i.productId === p._id.toString())?.qty || 1;
            return sum + p.price * qty;
          }, 0) * 100,
        ) / 100,
    });

    // Add products to user's purchased items
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { purchasedItems: { $each: productIds } },
    });

    res.json({
      success: true,
      url: `${baseUrl}/checkout/success?session_id=${sessionId}`,
      id: sessionId,
    });
  },
);

/**
 * @desc    Get my orders (purchase history)
 * @route   GET /api/v1/orders/me
 * @access  Private
 */
export const getMyOrders = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  },
);

/**
 * @desc    Get all orders
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getAllOrders = asyncHandler(
  async (_req: Request, res: Response) => {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  },
);
