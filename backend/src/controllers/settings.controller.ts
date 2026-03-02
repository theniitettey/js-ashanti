import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

export class SettingsController {
    static async updateSettings(req: Request, res: Response) {
        try {
            // Optional: Add auth check here if needed (likely admin only)
             const session = (req as any).session;
            
            if (!session?.user?.id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const hasPermission = await auth.api.userHasPermission({
                headers: fromNodeHeaders(req.headers),
                body: {
                    userId: session.user.id,
                    permission: {
                        Dashboard: ["create"] // Assuming create permission covers this for now
                    }
                }
            });

             if (!hasPermission) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const data = req.body;

            const settings = await prisma.businessSettings.create({
                data,
            });

            return res.json(settings);
        } catch (error) {
            console.error("Failed to save business settings:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static async getSettings(req: Request, res: Response) {
        try {
             const settings = await prisma.businessSettings.findFirst();
             return res.json(settings);
        } catch (error) {
            console.error("Failed to fetch business settings:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
