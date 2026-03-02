import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    image: true,
                }
            });
            return res.json(users);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            return res.status(500).json({ error: "Failed to fetch users" });
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.json(user);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            return res.status(500).json({ error: "Failed to fetch user" });
        }
    }
}
