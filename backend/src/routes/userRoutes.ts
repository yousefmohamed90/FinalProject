import { Router } from "express";
import {
  getUser,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router: Router = Router();

router.get("/:id", getUser);
router.use(protect);

router.put("/:id", updateUser);

export default router;
