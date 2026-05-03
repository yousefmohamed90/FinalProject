import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  deleteMe,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.delete("/me", protect, deleteMe);

export default router;
