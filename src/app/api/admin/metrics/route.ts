import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiCircuitBreaker } from "@/lib/circuit-breaker";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/admin/metrics
 * Returns comprehensive observability metrics for the analytics pipeline
 *
 * Metrics include:
 * - Job queue stats (pending, running, success/hour, failed/hour)
 * - Batch stats (open, sealed, analyzed, archived)
 * - Performance metrics (avg analysis time, p95)
 * - Circuit breaker state
 */
export async function GET(request: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const jobMetrics = await getJobMetrics();
    const batchMetrics = await getBatchMetrics();
    const performanceMetrics = await getPerformanceMetrics();
    const circuitBreakerMetrics = getCircuitBreakerMetrics();
    const deadLetterQueueMetrics = await getDeadLetterQueueMetrics();

    const metrics = {
      timestamp: new Date().toISOString(),
      jobs: jobMetrics,
      batches: batchMetrics,
      performance: performanceMetrics,
      circuit_breaker: circuitBreakerMetrics,
      dead_letter_queue: deadLetterQueueMetrics,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[Metrics] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve metrics" },
      { status: 500 }
    );
  }
}

async function getJobMetrics() {
  const [pending, running, lastHour] = await Promise.all([
    prisma.analysisJob.count({
      where: { status: "PENDING" },
    }),
    prisma.analysisJob.count({
      where: { status: "RUNNING" },
    }),
    prisma.analysisJob.findMany({
      where: {
        updated_at: {
          gte: new Date(Date.now() - 3600000), // Last hour
        },
      },
    }),
  ]);

  const success = lastHour.filter((j: any) => j.status === "SUCCESS").length;
  const failed = lastHour.filter((j: any) => j.status === "FAILED").length;

  // Find oldest pending job
  const oldestPending = await prisma.analysisJob.findFirst({
    where: { status: "PENDING" },
    orderBy: { created_at: "asc" },
  });

  const oldestPendingAgeSec = oldestPending
    ? Math.floor((Date.now() - oldestPending.created_at.getTime()) / 1000)
    : 0;

  return {
    pending,
    running,
    success_last_hour: success,
    failed_last_hour: failed,
    oldest_pending_age_seconds: oldestPendingAgeSec,
  };
}

async function getBatchMetrics() {
  const [open, sealed, analyzed] = await Promise.all([
    prisma.batch.count({
      where: { status: "OPEN" },
    }),
    prisma.batch.count({
      where: { status: "SEALED" },
    }),
    prisma.batch.count({
      where: { status: "ANALYZED" },
    }),
  ]);

  // Find oldest open batch
  const oldestOpen = await prisma.batch.findFirst({
    where: { status: "OPEN" },
    orderBy: { created_at: "asc" },
  });

  const oldestOpenAgeSec = oldestOpen
    ? Math.floor((Date.now() - oldestOpen.created_at.getTime()) / 1000)
    : 0;

  // Get total events
  const eventCount = await prisma.event.count();

  return {
    open,
    sealed,
    analyzed,
    total_events: eventCount,
    oldest_open_age_seconds: oldestOpenAgeSec,
  };
}

async function getPerformanceMetrics() {
  const completedJobs = await prisma.analysisJob.findMany({
    where: {
      status: "SUCCESS",
      analysis_time_ms: { not: null },
    },
    orderBy: { created_at: "desc" },
    take: 100, // Use last 100 for percentile calculation
  });

  if (completedJobs.length === 0) {
    return {
      avg_analysis_time_ms: 0,
      p95_analysis_time_ms: 0,
      p99_analysis_time_ms: 0,
      max_analysis_time_ms: 0,
      completed_jobs_count: 0,
    };
  }

  const times = completedJobs
    .map((j) => j.analysis_time_ms || 0)
    .sort((a, b) => a - b);

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95Index = Math.floor(times.length * 0.95);
  const p99Index = Math.floor(times.length * 0.99);

  return {
    avg_analysis_time_ms: Math.round(avg),
    p95_analysis_time_ms: times[p95Index] || 0,
    p99_analysis_time_ms: times[p99Index] || 0,
    max_analysis_time_ms: Math.max(...times),
    completed_jobs_count: times.length,
  };
}

async function getDeadLetterQueueMetrics() {
  const total = await prisma.deadLetterJob.count();
  const last24hours = await prisma.deadLetterJob.count({
    where: {
      failed_at: {
        gte: new Date(Date.now() - 24 * 3600000),
      },
    },
  });

  return {
    total,
    last_24_hours: last24hours,
  };
}

function getCircuitBreakerMetrics() {
  const metrics = aiCircuitBreaker.getMetrics();
  return {
    state: metrics.state,
    failure_count: metrics.failureCount,
    success_count: metrics.successCount,
    last_state_change: metrics.lastStateChange.toISOString(),
    last_failure_time: metrics.lastFailureTime?.toISOString() || null,
  };
}
