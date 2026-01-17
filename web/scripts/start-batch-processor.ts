#!/usr/bin/env tsx

import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config();

import { startBatchProcessor } from "../src/lib/batch-processor";
import { startWorker } from "../src/lib/worker";
import { startRecoveryLoop } from "../src/lib/recovery";
import { ANALYTICS_CONFIG } from "../src/lib/constants";

console.log("[Startup] Initializing production-grade analytics workers...");
console.log(
  "[Config] Worker poll interval:",
  ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS,
  "ms",
);
console.log(
  "[Config] Recovery interval:",
  ANALYTICS_CONFIG.RECOVERY_INTERVAL_MS,
  "ms",
);
console.log(
  "[Config] Batch seal interval:",
  ANALYTICS_CONFIG.BATCH_SEAL_INTERVAL_MS,
  "ms",
);
console.log("[Config] Cron interval:", ANALYTICS_CONFIG.CRON_INTERVAL_MS, "ms");

async function main() {
  try {
    await Promise.all([
      startWorker(ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS),
      startRecoveryLoop(),
      startBatchProcessor(),
    ]);

    console.log("✓ All workers started successfully");
    console.log(
      "  [Worker] Job claiming every",
      ANALYTICS_CONFIG.WORKER_POLL_INTERVAL_MS / 1000,
      "seconds",
    );
    console.log(
      "  [Recovery] Stuck job detection every",
      ANALYTICS_CONFIG.RECOVERY_INTERVAL_MS / 1000,
      "seconds",
    );
    console.log("  [Batch Sealer] Hybrid sealing (100 events OR 10 min)");
    console.log("  [Job Creator] PENDING jobs for SEALED batches");
    console.log(
      "  [Circuit Breaker] Protects AI API (5 failures → 10 min cooldown)",
    );
  } catch (error) {
    console.error("[Startup] Failed to start workers:", error);
    process.exit(1);
  }
}

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

main().catch((error) => {
  console.error("[Fatal] Worker initialization failed:", error);
  process.exit(1);
});
