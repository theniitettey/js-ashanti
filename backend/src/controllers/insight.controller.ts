import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class InsightController {
    static async getInsights(req: Request, res: Response) {
        try {
            const session = (req as any).session;
           
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (session.user.role !== "admin") {
                return res.status(403).json({ error: "Forbidden - Admin access required" });
            }

            const page = parseInt(req.query.page as string || "1");
            const limit = parseInt(req.query.limit as string || "50");
            const offset = parseInt(req.query.offset as string || "0");
            
            // Allow offset override or calculate from page
            const skip = offset > 0 ? offset : (page - 1) * limit;

            const insights = await prisma.insight.findMany({
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
                skip: skip,
            });

            const total = await prisma.insight.count();

            return res.json({
                insights,
                pagination: {
                    total,
                    limit,
                    offset: skip,
                    hasMore: skip + limit < total,
                },
            });

        } catch (error) {
            console.error("Error fetching insights:", error);
            return res.status(500).json({ error: "Failed to fetch insights" });
        }
    }
}
