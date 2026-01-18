/**
 * Production Analytics Configuration
 * All thresholds, timeouts, and intervals from spec
 */

export const ANALYTICS_CONFIG = {
  // Batch Settings
  BATCH_SIZE_THRESHOLD: 100, // Events to seal batch
  BATCH_TIME_WINDOW_MIN: 10, // Minutes to auto-seal

  // Job Settings
  JOB_LOCK_TIMEOUT_MIN: 10, // Job lock expiry before recovery
  MAX_JOB_ATTEMPTS: 5, // Before DLQ
  BASE_RETRY_DELAY_SEC: 60, // Exponential backoff base

  // Worker Timing
  WORKER_POLL_INTERVAL_MS: 5000, // Job claim frequency (5 seconds)
  RECOVERY_INTERVAL_MS: 60000, // Stuck job detection (60 seconds)
  CRON_INTERVAL_MS: 120000, // Batch analysis schedule (2 minutes)
  BATCH_SEAL_INTERVAL_MS: 60000, // Batch sealing frequency (1 minute)

  // Circuit Breaker
  CIRCUIT_BREAKER_THRESHOLD: 5, // Failures before OPEN
  CIRCUIT_BREAKER_COOLDOWN_MS: 600000, // 10 minutes

  // Recovery Settings
  STUCK_JOB_TIMEOUT_MIN: 15, // Mark as stuck if RUNNING > 15 min

  // Archival
  BATCH_ARCHIVE_AGE_DAYS: 30, // Move to archive after 30 days
};

export default ANALYTICS_CONFIG;
