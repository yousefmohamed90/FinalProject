import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import orderRoutes from "./orderRoutes.js";
import userRoutes from "./userRoutes.js";
import uploadRoutes from "./uploadRoutes.js";          // ← جديد
import { deleteReview, updateReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router: IRouter = Router();

// /api/healthz
router.use(healthRouter);

// /api/v1/...
router.use("/v1/auth", authRoutes);
router.use("/v1/products", productRoutes);
router.use("/v1/orders", orderRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/upload", uploadRoutes);                // ← جديد
router.delete("/v1/reviews/:id", protect, deleteReview);
router.put("/v1/reviews/:id", protect, updateReview);

export default router;
