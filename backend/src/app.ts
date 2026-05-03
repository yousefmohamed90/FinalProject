import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { mongoSanitizeMiddleware } from "./middleware/sanitize.js";

const app: Express = express();

// CORS — allow credentials so HttpOnly auth cookies work cross-site
app.use(
  cors({
    origin: process.env["CLIENT_URL"] || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);
app.use(morgan("dev"));

// Global rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
