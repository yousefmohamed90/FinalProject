import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  try {
    logger.info("Connecting to database...");

    await connectDB();

    logger.info("Database connected ✅");

    app.listen(port, () => {
      logger.info({ port }, "Server listening 🚀");
    });

  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start();