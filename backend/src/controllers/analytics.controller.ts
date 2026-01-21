import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

export class AnalyticsController {
    static async getStats(req: Request, res: Response) {
        try {
            const session = (req as any).session;
           
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (session.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            const [
                openBatches,
                sealedBatches,
                analyzedBatches,
                pendingJobs,
                runningJobs,
            ] = await Promise.all([
                prisma.batch.count({ where: { status: "OPEN" } }),
                prisma.batch.count({ where: { status: "SEALED" } }),
                prisma.batch.count({ where: { status: "ANALYZED" } }),
                prisma.analysisJob.count({ where: { status: "PENDING" } }),
                prisma.analysisJob.count({ where: { status: "RUNNING" } }),
            ]);

            return res.json({
                batches: {
                    open: openBatches,
                    sealed: sealedBatches,
                    analyzed: analyzedBatches,
                },
                jobs: { pending: pendingJobs, running: runningJobs },
                timestamp: new Date().toISOString(),
            });

        } catch (error) {
            console.error("Error fetching analytics stats:", error);
            return res.status(500).json({ error: "Failed to fetch stats" });
        }
    }

    static async getMetrics(req: Request, res: Response) {
        try {
            const session = (req as any).session;
           
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (session.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            // Parallel data fetching for performance
            const [
                pendingJobs,
                runningJobs,
                successLastHour,
                failedLastHour,
                oldestPending,
                
                openBatches,
                sealedBatches,
                analyzedBatches,
                oldestOpenBatch,

                avgAnalysisTime,
                p95AnalysisTime,
                
                dlqTotal,
                dlqLast24h
            ] = await Promise.all([
                // Jobs
                prisma.analysisJob.count({ where: { status: "PENDING" } }),
                prisma.analysisJob.count({ where: { status: "RUNNING" } }),
                prisma.analysisJob.count({ 
                    where: { 
                        status: "SUCCESS",
                        updated_at: { gte: new Date(Date.now() - 60 * 60 * 1000) }
                    } 
                }),
                prisma.analysisJob.count({ 
                    where: { 
                        status: "FAILED",
                        updated_at: { gte: new Date(Date.now() - 60 * 60 * 1000) }
                    } 
                }),
                prisma.analysisJob.findFirst({
                    where: { status: "PENDING" },
                    orderBy: { created_at: "asc" },
                    select: { created_at: true }
                }),

                // Batches
                prisma.batch.count({ where: { status: "OPEN" } }),
                prisma.batch.count({ where: { status: "SEALED" } }),
                prisma.batch.count({ where: { status: "ANALYZED" } }),
                prisma.batch.findFirst({
                    where: { status: "OPEN" },
                    orderBy: { created_at: "asc" },
                    select: { created_at: true }
                }),

                // Performance (Approximate average)
                prisma.analysisJob.aggregate({
                    _avg: { analysis_time_ms: true },
                    where: { status: "SUCCESS" }
                }),
                // P95 calculation is complex in Prism/SQL, simpler to just get recent success jobs and calc in memory for dashboard
                prisma.analysisJob.findMany({
                    where: { status: "SUCCESS" },
                    orderBy: { created_at: "desc" },
                    take: 100,
                    select: { analysis_time_ms: true }
                }),

                // DLQ
                prisma.deadLetterJob.count(),
                prisma.deadLetterJob.count({
                    where: { failed_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                })
            ]);

            // Calculate Oldest Ages
            const now = Date.now();
            const oldestPendingAge = oldestPending ? (now - oldestPending.created_at.getTime()) / 1000 : null;
            const oldestOpenBatchAge = oldestOpenBatch ? (now - oldestOpenBatch.created_at.getTime()) / 1000 : null;

            // Calculate P95
            const recentTimes = p95AnalysisTime.map(j => j.analysis_time_ms || 0).sort((a, b) => a - b);
            const p95Index = Math.floor(recentTimes.length * 0.95);
            const p95Val = recentTimes.length > 0 ? recentTimes[p95Index] : 0;

            // Get Circuit Breaker Metrics
            const { aiCircuitBreaker } = await import('../lib/circuit-breaker');
            const cbMetrics = aiCircuitBreaker.getMetrics();

            return res.json({
                jobs: {
                    pending: pendingJobs,
                    running: runningJobs,
                    success_last_hour: successLastHour,
                    failed_last_hour: failedLastHour,
                    oldest_pending_age_seconds: oldestPendingAge
                },
                batches: {
                    open: openBatches,
                    sealed: sealedBatches,
                    analyzed: analyzedBatches,
                    oldest_open_age_seconds: oldestOpenBatchAge
                },
                performance: {
                    avg_analysis_time_ms: avgAnalysisTime._avg.analysis_time_ms || 0,
                    p95_analysis_time_ms: p95Val,
                    avg_batch_size: 0 // Not easily queryable without aggregate on relation, can leave as 0 for now or add complex query
                },
                circuit_breaker: {
                    state: cbMetrics.state,
                    failure_count: cbMetrics.failureCount,
                    last_state_change: cbMetrics.lastStateChange?.toISOString() || null
                },
                dead_letter_queue: {
                    total: dlqTotal,
                    last_24_hours: dlqLast24h
                }
            });

        } catch (error) {
            console.error("Error fetching admin metrics:", error);
            return res.status(500).json({ error: "Failed to fetch metrics" });
        }
    }
}
