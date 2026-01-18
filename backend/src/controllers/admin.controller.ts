import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AdminController {
    static async getBatches(req: Request, res: Response) {
        try {
            const session = (req as any).session;
           
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (session.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            // Parse pagination params
            const page = parseInt(req.query.page as string || "1");
            const limit = parseInt(req.query.limit as string || "50");
            const skip = (page - 1) * limit;

            // Get total count
            const total = await prisma.batch.count({
                where: {
                    status: {
                        in: ["OPEN", "SEALED", "ANALYZED"],
                    },
                },
            });

            // Fetch batches with their jobs
            const batches = await prisma.batch.findMany({
                where: {
                    status: {
                        in: ["OPEN", "SEALED", "ANALYZED"],
                    },
                },
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
            });

            // Get analysis jobs for these batches
            const batchIds = batches.map((b: { batch_id: string }) => b.batch_id);
            const jobs = await prisma.analysisJob.findMany({
                where: {
                    batch_id: { in: batchIds },
                    status: { in: ["PENDING", "RUNNING"] },
                },
                orderBy: { created_at: "desc" },
            });

            // Create a map of batch_id to job
            const jobsByBatchId = new Map(jobs.map((job: { batch_id: string }) => [job.batch_id, job]));

            // Format response
            const formattedBatches = batches.map((batch: any) => {
                const job = jobsByBatchId.get(batch.batch_id) as any;
                return {
                    batch_id: batch.batch_id,
                    status: batch.status,
                    event_count: batch.event_count,
                    created_at: batch.created_at.toISOString(),
                    sealed_at: batch.sealed_at?.toISOString() || null,
                    analysis_job: job
                        ? {
                            job_id: job.job_id,
                            status: job.status,
                            attempt_count: job.attempt_count,
                            last_error: job.last_error,
                        }
                        : undefined,
                };
            });

            return res.json({
                batches: formattedBatches,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });

        } catch (error) {
            console.error("Error fetching batches:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
