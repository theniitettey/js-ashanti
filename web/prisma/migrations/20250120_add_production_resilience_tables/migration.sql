-- CreateTable Event
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "batch_id" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "user_id" VARCHAR(255),
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable Batch
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batch_id" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "event_count" INTEGER NOT NULL DEFAULT 0,
    "sealed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnalysisJob
CREATE TABLE "analysis_jobs" (
    "id" TEXT NOT NULL,
    "job_id" VARCHAR(255) NOT NULL,
    "batch_id" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "lock_expires_at" TIMESTAMP(3),
    "trigger_type" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "last_error" TEXT,
    "error_context" JSONB,
    "analysis_time_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable DeadLetterJob
CREATE TABLE "dead_letter_jobs" (
    "id" TEXT NOT NULL,
    "dlq_id" VARCHAR(255) NOT NULL,
    "job_id" VARCHAR(255) NOT NULL,
    "batch_id" VARCHAR(255) NOT NULL,
    "attempt_count" INTEGER NOT NULL,
    "last_error" TEXT NOT NULL,
    "error_context" JSONB NOT NULL,
    "failed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dead_letter_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable KafkaOutbox
CREATE TABLE "kafka_outbox" (
    "id" TEXT NOT NULL,
    "outbox_id" VARCHAR(255) NOT NULL,
    "aggregate_id" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kafka_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable ArchivedBatch
CREATE TABLE "batches_archive" (
    "id" TEXT NOT NULL,
    "batch_id" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ARCHIVED',
    "event_count" INTEGER NOT NULL,
    "sealed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_archive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_batch_id_idx" ON "events"("batch_id");

-- CreateIndex
CREATE INDEX "events_timestamp_idx" ON "events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_id_key" ON "batches"("batch_id");

-- CreateIndex
CREATE INDEX "batches_status_idx" ON "batches"("status");

-- CreateIndex
CREATE INDEX "batches_created_at_idx" ON "batches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_jobs_job_id_key" ON "analysis_jobs"("job_id");

-- CreateIndex
CREATE INDEX "analysis_jobs_status_idx" ON "analysis_jobs"("status");

-- CreateIndex
CREATE INDEX "analysis_jobs_lock_expires_at_idx" ON "analysis_jobs"("lock_expires_at");

-- CreateIndex
CREATE INDEX "analysis_jobs_updated_at_idx" ON "analysis_jobs"("updated_at");

-- CreateIndex
CREATE INDEX "analysis_jobs_batch_id_idx" ON "analysis_jobs"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "dead_letter_jobs_dlq_id_key" ON "dead_letter_jobs"("dlq_id");

-- CreateIndex
CREATE INDEX "dead_letter_jobs_failed_at_idx" ON "dead_letter_jobs"("failed_at");

-- CreateIndex
CREATE INDEX "dead_letter_jobs_batch_id_idx" ON "dead_letter_jobs"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "kafka_outbox_outbox_id_key" ON "kafka_outbox"("outbox_id");

-- CreateIndex
CREATE INDEX "kafka_outbox_published_idx" ON "kafka_outbox"("published");

-- CreateIndex
CREATE INDEX "kafka_outbox_created_at_idx" ON "kafka_outbox"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "batches_archive_batch_id_key" ON "batches_archive"("batch_id");

-- CreateIndex
CREATE INDEX "batches_archive_archived_at_idx" ON "batches_archive"("archived_at");
