import dotenv from "dotenv";
import { startServer } from "./server";
import { startWorker } from "./worker/worker";
import { startBatchProcessor } from "./worker/batch-processor";
import { startRecoveryLoop } from "./worker/recovery";

// Load environment variables
dotenv.config();

/**
 * Unified Backend Entry Point
 * Initializes the API Server and all background workers
 */
async function bootstrap() {
  console.log("-----------------------------------------");
  console.log("   JS-ASHANTI BACKEND INITIALIZATION     ");
  console.log("-----------------------------------------");

  try {
    // 1. Start API Server
    startServer();

    // 2. Start Background Worker (Job Execution)
    await startWorker();

    // 3. Start Batch Processor (OPEN -> SEALED -> PENDING)
    startBatchProcessor();

    // 4. Start Recovery Loop (Self-Healing)
    await startRecoveryLoop();

    console.log("-----------------------------------------");
    console.log("   ALL SERVICES INITIALIZED SUCCESSFULLY  ");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("FATAL: Failed to initialize backend services:", error);
    process.exit(1);
  }
}

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Run bootstrap
bootstrap();
