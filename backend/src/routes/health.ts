import { Router, type IRouter } from "express";
import mongoose from "mongoose";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

export default router;
