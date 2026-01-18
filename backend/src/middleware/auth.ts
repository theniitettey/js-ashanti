import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const headers = fromNodeHeaders(req.headers);

        // Support Bearer token for mobile app (map to session cookie)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            // Append cookie header if missing (Better-Auth uses cookies by default)
            const cookieName = "auth-cookies.session_token"; // Matches config in src/lib/auth.ts
            const currentCookie = headers.get("cookie") || "";
            headers.set("cookie", `${currentCookie}; ${cookieName}=${token}`);
        }

        const session = await auth.api.getSession({
            headers
        });

        if (session) {
            (req as any).session = session;
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};
