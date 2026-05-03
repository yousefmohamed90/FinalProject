import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  logger.info("Attempting MongoDB connection with URI: %s", uri.replace(/:[^:]*@/, ":***@"));

  try {
    // Create a promise that rejects after a hard timeout
    const connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // Max time to select a server
      socketTimeoutMS: 5000,           // Socket timeout (was too high)
      connectTimeoutMS: 10000,         // Time to wait for initial connection
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
    });

    // Hard timeout: 15 seconds max
    const hardTimeout = new Promise((_resolve, reject) => {
      setTimeout(
        () => reject(new Error("MongoDB connection exceeded hard timeout of 15 seconds")),
        15000
      );
    });

    await Promise.race([connectionPromise, hardTimeout]);

    logger.info("MongoDB connected successfully ✅");

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error({ error, errorMsg }, "MongoDB connection failed ❌");
    throw error;
  }
}