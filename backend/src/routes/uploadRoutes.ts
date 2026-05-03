import { Router, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router: Router = Router();

// استخدام مجلد النظام المؤقت لحفظ الملفات لتجنب أي مشاكل في الصلاحيات أو المسارات
const tempDir = os.tmpdir();

const upload = multer({
  dest: tempDir,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-zip",
      "application/octet-stream",
    ];
    if (allowed.includes(file.mimetype) || ext === ".zip") {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  },
});

/**
 * @desc   Upload a ZIP file to Cloudinary
 * @route  POST /api/v1/upload/zip
 * @access Private
 */
router.post(
  "/zip",
  protect,
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError("No file uploaded", 400);

    const tempPath = req.file.path;

    try {
      // تحقق إن Cloudinary متكونفج صح
      const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
      const apiKey    = process.env["CLOUDINARY_API_KEY"];
      const apiSecret = process.env["CLOUDINARY_API_SECRET"];

      if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env",
          503,
        );
      }

      const result = await cloudinary.uploader.upload(tempPath, {
        resource_type: "raw",
        folder: "source-code",
        public_id: `${req.user!._id}_${Date.now()}.zip`,
        overwrite: false,
        use_filename: true,
      });

      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err: any) {
      // اطبع الـ error الحقيقي في السيرفر للـ debug
      console.error("[Upload] Cloudinary error:", err?.message ?? err);
      throw new ApiError(err?.message ?? "Upload to Cloudinary failed", 500);
    } finally {
      // احذف الملف المؤقت دايماً
      fs.unlink(tempPath, () => {});
    }
  }),
);

export default router;
