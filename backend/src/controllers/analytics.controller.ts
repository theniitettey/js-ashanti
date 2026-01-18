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
}
