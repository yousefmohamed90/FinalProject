import type { Request, Response } from "express";
import slugify from "slugify";
import Product from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all products with advanced filtering, sort, search, pagination
 * @route   GET /api/v1/products
 * @access  Public
 *
 * Query parameters:
 *  - search:        text index search
 *  - category:      exact match
 *  - technology:    matches a value in technologies[]
 *  - author:        matches author ID
 *  - minPrice/maxPrice: range filter
 *  - minRating:     averageRating gte
 *  - sort:          one of `newest`, `price`, `-price`, `rating`, `popular`
 *  - page, limit:   pagination (defaults: 1, 12)
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    technology,
    minPrice,
    maxPrice,
    minRating,
    author,
    sort = "newest",
    page = "1",
    limit = "12",
  } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};

  if (search && search.trim().length > 0) {
    filter["$text"] = { $search: search };
  }
  if (category) filter["category"] = category;
  if (technology) filter["technologies"] = technology;
  if (author) filter["author"] = author;

  const priceFilter: Record<string, number> = {};
  if (minPrice) priceFilter["$gte"] = Number(minPrice);
  if (maxPrice) priceFilter["$lte"] = Number(maxPrice);
  if (Object.keys(priceFilter).length > 0) filter["price"] = priceFilter;

  if (minRating) filter["averageRating"] = { $gte: Number(minRating) };

  let sortSpec: Record<string, 1 | -1> = { createdAt: -1 };
  switch (sort) {
    case "price":
      sortSpec = { price: 1 };
      break;
    case "-price":
      sortSpec = { price: -1 };
      break;
    case "rating":
      sortSpec = { averageRating: -1 };
      break;
    case "popular":
      sortSpec = { numOfReviews: -1, averageRating: -1 };
      break;
    case "newest":
    default:
      sortSpec = { createdAt: -1 };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name"),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

/**
 * @desc    Get featured products (homepage hero/grid)
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await Product.find({ isFeatured: true })
      .sort({ averageRating: -1 })
      .limit(8)
      .populate("author", "name");

    res.json({ success: true, count: products.length, products });
  },
);

/**
 * @desc    Get list of categories with counts
 * @route   GET /api/v1/products/categories
 * @access  Public
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    res.json({ success: true, categories });
  },
);

/**
 * @desc    Get a single product by slug
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const isId = slug.match(/^[0-9a-fA-F]{24}$/);
    const product = await Product.findOne(isId ? { _id: slug } : { slug })
      .populate("author", "name email createdAt")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });

    if (!product) throw new ApiError("Product not found", 404);
    res.json({ success: true, product });
  },
);

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const data = req.body as Record<string, unknown>;
    if (!data["slug"] && typeof data["title"] === "string") {
      data["slug"] = slugify(data["title"], { lower: true, strict: true });
    }
    data["author"] = req.user._id;

    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  },
);

/**
 * @desc    Update a product
 * @route   PUT /api/v1/products/:id
 * @access  Private (Owner only)
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { id } = req.params as { id: string };
    
    // Check if product exists and user is the owner
    const product = await Product.findById(id);
    if (!product) throw new ApiError("Product not found", 404);
    
    if (product.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError("You are not authorized to update this product", 403);
    }

    const data = req.body as Record<string, unknown>;
    if (typeof data["title"] === "string") {
      data["slug"] = slugify(data["title"], { lower: true, strict: true });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("author", "name email");
    
    res.json({ success: true, product: updatedProduct });
  },
);

/**
 * @desc    Delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Owner only)
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { id } = req.params as { id: string };
    
    // Check if product exists and user is the owner
    const product = await Product.findById(id);
    if (!product) throw new ApiError("Product not found", 404);
    
    if (product.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError("You are not authorized to delete this product", 403);
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  },
);

/**
 * @desc    Purchase a product (add to user's purchased items)
 * @route   POST /api/v1/products/:id/purchase
 * @access  Private
 */
export const purchaseProduct = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { id } = req.params as { id: string };

    // Check if product exists
    const product = await Product.findById(id).populate("author", "name email");
    if (!product) throw new ApiError("Product not found", 404);

    // Check if user already owns this product
    const alreadyOwns = req.user.purchasedItems.some((p) => p.toString() === id);
    if (alreadyOwns) {
      throw new ApiError("You already own this product", 400);
    }

    // Check if user is trying to buy their own product
    if (product.author._id.toString() === req.user._id.toString()) {
      throw new ApiError("You cannot purchase your own product", 400);
    }

    // Add product to user's purchased items
    req.user.purchasedItems.push(product._id);
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Product purchased successfully",
      product: {
        _id: product._id,
        title: product.title,
        price: product.price,
        author: product.author,
      },
    });
  },
);

/**
 * @desc    Download the secure source code link for a purchased product
 * @route   GET /api/v1/products/:id/download
 * @access  Private (must own product)
 */
export const downloadProduct = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError("Not authenticated", 401);

    const { id } = req.params as { id: string };

    const owns = req.user.purchasedItems.some((p) => p.toString() === id);
    if (!owns && req.user.role !== "admin") {
      throw new ApiError("You don't own this product", 403);
    }

    const product = await Product.findById(id).select("+sourceCodeUrl title");
    if (!product) throw new ApiError("Product not found", 404);
    if (!product.sourceCodeUrl) {
      throw new ApiError("Source code is not available for this product", 404);
    }

    let downloadUrl = product.sourceCodeUrl;

    // Convert GitHub repo URL to direct ZIP download URL
    if (downloadUrl.includes("github.com") && !downloadUrl.endsWith(".zip")) {
      // Basic cleanup: remove trailing slash or .git
      downloadUrl = downloadUrl.replace(/\/$/, "").replace(/\.git$/, "");
      
      // GitHub supports /zipball/master (or main) which redirects to the latest zip
      // We'll use /archive/refs/heads/main.zip as a common default, or zipball/master
      // To be safer across different default branches, zipball/master usually works or we can try archive/master.zip
      downloadUrl = `${downloadUrl}/archive/refs/heads/main.zip`;
    }

    res.status(200).json({ success: true, sourceCodeUrl: downloadUrl });
  },
);
