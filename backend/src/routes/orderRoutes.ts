import { Router } from "express";
import {
  createCheckoutSession,
  getMyOrders,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";

const router: Router = Router();

router.post("/checkout", protect, createCheckoutSession);
router.get("/me", protect, getMyOrders);

export default router;
