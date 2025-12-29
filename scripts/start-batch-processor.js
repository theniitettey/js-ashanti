#!/usr/bin/env node

/**
 * Batch processor initialization script
 * Run this in a separate process in production
 * Usage: node scripts/start-batch-processor.js
 */

import { startBatchProcessor } from "../src/lib/batch-processor.js";

console.log("Starting real-time analytics batch processor...");

// Start the cron job
startBatchProcessor();

console.log("✓ Batch processor running");
console.log("  - Processes events every 5 minutes");
console.log("  - Sends batches to AI for analysis");
console.log("  - Stores insights in database");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n✓ Batch processor stopped");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n✓ Batch processor terminated");
  process.exit(0);
});
