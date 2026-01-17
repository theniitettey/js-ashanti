#!/usr/bin/env node

/**
 * Production worker initialization script
 * Starts all 4 concurrent loops for resilient analytics pipeline
 * Usage: node scripts/start-batch-processor.js
 */

import { startBatchProcessor } from "../src/lib/batch-processor.js";
import { startWorker } from "../src/lib/worker.js";
import { startRecoveryLoop } from "../src/lib/recovery.js";
import { ANALYTICS_CONFIG } from "../src/lib/constants.js";

console.log("[Startup] Initializing production-grade analytics workers...");
console.log(
  "[Config] Worker poll interval:",
  ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS,
  "ms"
);
console.log(
  "[Config] Recovery interval:",
  ANALYTICS_CONFIG.RECOVERY_INTERVAL_MS,
  "ms"
);
console.log(
  "[Config] Batch seal interval:",
  ANALYTICS_CONFIG.BATCH_SEAL_INTERVAL_MS,
  "ms"
);
console.log("[Config] Cron interval:", ANALYTICS_CONFIG.CRON_INTERVAL_MS, "ms");

async function main() {
  try {
    // Start all 4 concurrent loops
    await Promise.all([
      // 1. Job claiming and processing loop (5 seconds)
      startWorker(ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS),

      // 2. Recovery loop - detects stuck jobs (60 seconds)
      startRecoveryLoop(),

      // 3. Batch processor - seals batches + creates jobs (cron)
      startBatchProcessor(),
    ]);

    console.log("✓ All workers started successfully");
    console.log(
      "  [Worker] Job claiming every",
      ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS / 1000,
      "seconds"
    );
    console.log(
      "  [Recovery] Stuck job detection every",
      ANALYTICS_CONFIG.RECOVERY_INTERVAL_MS / 1000,
      "seconds"
    );
    console.log("  [Batch Sealer] Hybrid sealing (100 events OR 10 min)");
    console.log("  [Job Creator] PENDING jobs for SEALED batches");
    console.log(
      "  [Circuit Breaker] Protects AI API (5 failures → 10 min cooldown)"
    );
  } catch (error) {
    console.error("[Startup] Failed to start workers:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
let isShuttingDown = false;

process.on("SIGINT", () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("\n[Shutdown] Received SIGINT, gracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("\n[Shutdown] Received SIGTERM, gracefully shutting down...");
  process.exit(0);
});

// Start workers
main().catch((error) => {
  console.error("[Fatal] Worker initialization failed:", error);
  process.exit(1);
});
