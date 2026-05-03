import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  downloadProduct,
  getCategories,
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  purchaseProduct,
  updateProduct,
} from "../controllers/productController.js";
import { createReview } from "../controllers/reviewController.js";
import { authorizeRoles, protect } from "../middleware/auth.js";

const router: Router = Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/:slug", getProductBySlug);

router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

router.post("/:id/purchase", protect, purchaseProduct);
router.get("/:id/download", protect, downloadProduct);
router.post("/:id/reviews", protect, createReview);

export default router;
